import Order from "../models/Order.js";
import User from "../models/User.js";

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

    const validCartItems = user.cart.filter(
      (item) => item.product && item.product.type === "physical"
    );

    if (validCartItems.length === 0) {
      return res.status(400).json({ message: "Cart does not contain valid physical products" });
    }

    let totalAmount = 0;

    const orderItems = validCartItems.map(item => {
      totalAmount += item.product.price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        type: "physical",
        quantity: item.quantity,
        price: item.product.price
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
