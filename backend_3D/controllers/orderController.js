import Order from "../models/Order.js";
import User from "../models/User.js";
import { Readable } from "stream";

const sanitizeDownloadFilename = (value) => {
  const safe = (value || "stl-model")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

  if (safe.toLowerCase().endsWith(".stl")) {
    return safe;
  }

  return `${safe}.stl`;
};

/* ------------------ CREATE ORDER ------------------ */

export const createOrder = async (req, res) => {
  try {
    const { addressId } = req.body;

    const user = await User.findById(req.user._id)
      .populate("cart.product");

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const selectedAddress = user.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!selectedAddress) {
      return res.status(400).json({ message: "Invalid address selected" });
    }

    let totalAmount = 0;

    const orderItems = user.cart.map(item => {
      totalAmount += item.product.price * item.quantity;

      const isStlProduct = item.product.type === "stl";

      return {
        product: item.product._id,
        name: item.product.name,
        type: item.product.type,
        quantity: item.quantity,
        price: item.product.price,
        stlFile: isStlProduct ? item.product.stlFile || "" : "",
        stlFilePublicId: isStlProduct ? item.product.stlFilePublicId || "" : "",
        stlFileOriginalName: isStlProduct
          ? item.product.stlFileOriginalName || ""
          : ""
      };
    });


    const newOrder = await Order.create({
      user: user._id,
      items: orderItems,
      addressSnapshot: selectedAddress,
      totalAmount,
      paymentStatus: "Pending",
      orderStatus: "Pending"
    });

    res.status(201).json({
      message: "Order created. Proceed to payment.",
      orderId: newOrder._id
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

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be paid" });
    }

    if (order.paymentStatus === "Paid")
      return res.status(400).json({ message: "Order already paid" });

    // Payment gateway is not integrated yet.
    // Keep this endpoint non-functional to avoid fake payment confirmations.
    return res.status(501).json({
      message: "Payment integration is pending. Order cannot be marked as paid yet."
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


/* ------------------ CANCEL ORDER (USER) ------------------ */

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Ensure user owns the order
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Only allow cancellation if order is still Pending
    if (order.orderStatus !== "Pending")
      return res.status(400).json({ message: "Order cannot be cancelled" });

    order.orderStatus = "Cancelled";
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
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ USER: DOWNLOAD STL ------------------ */

export const downloadOrderStl = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure user owns the order.
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Cancelled orders cannot be downloaded" });
    }

    const orderItem = order.items.id(itemId);

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (orderItem.type !== "stl") {
      return res.status(400).json({ message: "Download available only for STL items" });
    }

    if (!orderItem.stlFile) {
      return res.status(404).json({ message: "STL file not available for this item" });
    }

    const cloudResponse = await fetch(orderItem.stlFile);

    if (!cloudResponse.ok || !cloudResponse.body) {
      return res.status(502).json({ message: "Failed to fetch STL file" });
    }

    const fileName = sanitizeDownloadFilename(
      orderItem.stlFileOriginalName || orderItem.name || "stl-model"
    );

    res.setHeader(
      "Content-Type",
      cloudResponse.headers.get("content-type") || "application/octet-stream"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    Readable.fromWeb(cloudResponse.body).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


/* ------------------ ADMIN: GET ALL ORDERS ------------------ */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


/* ------------------ ADMIN: UPDATE ORDER STATUS ------------------ */

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.json({ message: "Order status updated" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
