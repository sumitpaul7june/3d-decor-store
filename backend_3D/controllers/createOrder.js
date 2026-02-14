import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

/* -------- CREATE ORDER -------- */

export const createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    const orderItems = user.cart.map(item => {
      totalAmount += item.product.price * item.quantity;

      return {
        product: item.product._id,
        type: item.product.type,
        quantity: item.quantity,
        price: item.product.price
      };
    });

    const newOrder = await Order.create({
      user: user._id,
      items: orderItems,
      addressSnapshot: address,
      totalAmount,
      paymentStatus: "Paid", // demo payment for now
      orderStatus: "Pending"
    });

    // Clear cart after order
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**GET USER ORDERS */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


/**ADMIN GET ALL ORDERS */
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
/**ADMIN UPDATE ORDER STATUS */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.json({ message: "Order status updated" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
