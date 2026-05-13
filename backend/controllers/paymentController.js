import crypto from "crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { sendPaymentSuccessEmail } from "../utils/orderEmails.js";

dotenv.config();

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

const buildTimelineEntry = ({ status = "", label = "", note = "" }) => ({
  status,
  label,
  note,
  createdAt: new Date(),
});

const pushTimelineEntry = (order, entry) => {
  const currentTimeline = Array.isArray(order.statusTimeline) ? order.statusTimeline : [];
  order.statusTimeline = [...currentTimeline, entry];
};

export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay is not configured" });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const appOrder = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!appOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (appOrder.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be paid" });
    }

    if (appOrder.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const amount = Number(appOrder.totalAmount);
    const receipt = `qalarahi_${String(appOrder._id).slice(-8)}_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        appOrderId: appOrder._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    const payment = await Payment.findOneAndUpdate(
      { appOrderId: appOrder._id },
      {
        appOrderId: appOrder._id,
        userId: req.user._id,
        orderId: razorpayOrder.id,
        amount,
        status: "created",
        address: appOrder.addressSnapshot?.addressLine || "",
        productName: appOrder.items?.map((item) => item.name).join(", "),
        receipt,
        failureReason: "",
        failureCode: "",
        lastAttemptedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      appOrderId: appOrder._id,
      razorpayOrderId: razorpayOrder.id,
      order: razorpayOrder,
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markPaymentFailed = async (req, res) => {
  try {
    const {
      appOrderId,
      razorpay_order_id,
      failureReason = "",
      failureCode = "",
      paymentId = "",
    } = req.body;

    if (!appOrderId) {
      return res.status(400).json({ message: "Order id is required" });
    }

    const appOrder = await Order.findOne({ _id: appOrderId, user: req.user._id });

    if (!appOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Payment.findOneAndUpdate(
      { appOrderId },
      {
        appOrderId,
        userId: req.user._id,
        orderId: razorpay_order_id || "",
        paymentId: paymentId || "",
        amount: appOrder.totalAmount,
        status: "failed",
        failureReason: failureReason || "Payment not completed",
        failureCode,
        lastAttemptedAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Payment failure recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay is not configured" });
    }

    const {
      appOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!appOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const appOrder = await Order.findOne({ _id: appOrderId, user: req.user._id });

    if (!appOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { appOrderId, orderId: razorpay_order_id },
        {
          status: "failed",
          failureReason: "Invalid payment signature",
          failureCode: "invalid_signature",
          lastAttemptedAt: new Date(),
        }
      );

      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    let paymentDetails = null;

    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (error) {
      paymentDetails = null;
    }

    await Payment.findOneAndUpdate(
      { appOrderId, orderId: razorpay_order_id },
      {
        appOrderId,
        userId: req.user._id,
        paymentId: razorpay_payment_id,
        status: "success",
        method: paymentDetails?.method || "",
        contact: paymentDetails?.contact || "",
        email: paymentDetails?.email || "",
        verifiedAt: new Date(),
        lastAttemptedAt: new Date(),
        failureReason: "",
        failureCode: "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    appOrder.paymentStatus = "Paid";
    pushTimelineEntry(
      appOrder,
      buildTimelineEntry({
        status: "Paid",
        label: "Payment confirmed",
        note: "Razorpay payment verified successfully",
      })
    );
    await appOrder.save();

    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    const user = await User.findById(req.user._id).select("name email");
    sendPaymentSuccessEmail({ user, order: appOrder }).catch((error) => {
      console.error("PAYMENT SUCCESS EMAIL ERROR:", error);
    });

    res.json({ success: true, orderId: appOrder._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
