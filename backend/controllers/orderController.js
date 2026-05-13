import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { sendOrderPlacedEmail, sendOrderStatusEmail } from "../utils/orderEmails.js";

const ORDER_STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

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

const enrichOrdersWithPayments = async (ordersInput) => {
  const orders = Array.isArray(ordersInput) ? ordersInput : [ordersInput].filter(Boolean);

  if (!orders.length) {
    return Array.isArray(ordersInput) ? [] : null;
  }

  const orderIds = orders.map((order) => order._id);
  const payments = await Payment.find({ appOrderId: { $in: orderIds } }).sort({
    updatedAt: -1,
  });

  const paymentMap = new Map();

  payments.forEach((payment) => {
    const key = String(payment.appOrderId);
    if (!paymentMap.has(key)) {
      paymentMap.set(key, payment.toObject());
    }
  });

  const serialized = orders.map((order) => {
    const plainOrder = typeof order.toObject === "function" ? order.toObject() : order;
    return {
      ...plainOrder,
      payment: paymentMap.get(String(plainOrder._id)) || null,
    };
  });

  return Array.isArray(ordersInput) ? serialized : serialized[0];
};

const getOrderBaseQuery = (filter = {}) =>
  Order.find(filter)
    .populate("user", "name email")
    .populate("items.product", "name coverImage images category price");

const getSingleOrderBaseQuery = (filter = {}) =>
  Order.findOne(filter)
    .populate("user", "name email")
    .populate("items.product", "name coverImage images category price");

/* ------------------ CREATE ORDER ------------------ */

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const selectedAddress = user.addresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!selectedAddress) {
      return res.status(400).json({ message: "Invalid address selected" });
    }

    const validCartItems = user.cart.filter(
      (item) => item.product && item.product.type === "physical"
    );

    if (validCartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart does not contain valid physical products" });
    }

    let totalAmount = 0;

    const orderItems = validCartItems.map((item) => {
      totalAmount += item.product.price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        type: "physical",
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    const newOrder = await Order.create({
      user: user._id,
      items: orderItems,
      addressSnapshot: selectedAddress,
      totalAmount,
      paymentStatus: "Pending",
      orderStatus: "Pending",
      statusTimeline: [
        buildTimelineEntry({
          status: "Pending",
          label: "Order placed",
          note: "Awaiting payment confirmation",
        }),
      ],
    });

    sendOrderPlacedEmail({ user, order: newOrder }).catch((error) => {
      console.error("ORDER PLACED EMAIL ERROR:", error);
    });

    res.status(201).json({
      message: "Order created. Proceed to payment.",
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ MARK ORDER AS PAID ------------------ */

export const markOrderAsPaid = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const orderFilter = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const order = await Order.findOne(orderFilter);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be paid" });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    return res.status(501).json({
      message: "Payment integration is pending. Order cannot be marked as paid yet.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ CANCEL ORDER (USER) ------------------ */

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = "Cancelled";
    pushTimelineEntry(
      order,
      buildTimelineEntry({
        status: "Cancelled",
        label: "Order cancelled",
        note: "Cancelled by customer",
      })
    );
    await order.save();

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ GET USER ORDERS ------------------ */

export const getMyOrders = async (req, res) => {
  try {
    const orders = await getOrderBaseQuery({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(await enrichOrdersWithPayments(orders));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getMyOrderById = async (req, res) => {
  try {
    const orderDoc = await getSingleOrderBaseQuery({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(await enrichOrdersWithPayments(orderDoc));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: GET ALL ORDERS ------------------ */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getOrderBaseQuery().sort({ createdAt: -1 });
    res.json(await enrichOrdersWithPayments(orders));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: GET SINGLE ORDER ------------------ */

export const getAdminOrderById = async (req, res) => {
  try {
    const orderDoc = await getSingleOrderBaseQuery({ _id: req.params.id });

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(await enrichOrdersWithPayments(orderDoc));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: UPDATE ORDER STATUS ------------------ */

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== status) {
      order.orderStatus = status;
      pushTimelineEntry(
        order,
        buildTimelineEntry({
          status,
          label: `Order ${status.toLowerCase()}`,
          note: "Updated by admin",
        })
      );
      await order.save();

      const user = await User.findById(order.user).select("name email");
      sendOrderStatusEmail({ user, order }).catch((error) => {
        console.error("ORDER STATUS EMAIL ERROR:", error);
      });
    }

    res.json({ message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateOrderDetails = async (req, res) => {
  try {
    const { trackingLink, refundStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (trackingLink !== undefined) {
      order.trackingLink = trackingLink;
    }

    if (refundStatus !== undefined) {
      if (!["None", "Pending", "Processed"].includes(refundStatus)) {
        return res.status(400).json({ message: "Invalid refund status" });
      }
      order.refundStatus = refundStatus;
    }

    await order.save();
    res.json({ message: "Order details updated" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdminOrderNote = async (req, res) => {
  try {
    const note = String(req.body.note || "").trim();

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.adminNote = note;
    await order.save();

    res.json({ message: "Admin note updated", note: order.adminNote });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
