import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

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

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
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
        { orderId: razorpay_order_id, appOrderId },
        { status: "failed" }
      );

      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id, appOrderId },
      {
        appOrderId,
        userId: req.user._id,
        paymentId: razorpay_payment_id,
        status: "success",
      },
      { new: true }
    );

    appOrder.paymentStatus = "Paid";
    await appOrder.save();

    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    res.json({ success: true, orderId: appOrder._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
