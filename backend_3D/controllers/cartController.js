import User from "../models/User.js";
import Product from "../models/Product.js";
/* ALL PRODUCTS FROM CART */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product");

    res.json(user.cart);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/*ADD TO CART */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.user._id);

    const existingItem  = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({
        product: productId,
        quantity: quantity || 1
      });
    }
    await user.save();
    res.json({ message: "Product added to cart" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**Update Quantity */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res.status(400).json({ message: "ProductId and quantity required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;

    await user.save();

    res.json({
      message: "Cart updated",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.json({ message: "Item removed from cart" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
