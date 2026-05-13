import User from "../models/User.js";
import Product from "../models/Product.js";

const MAX_CART_ITEM_QUANTITY = 10;
/* ALL PRODUCTS FROM CART */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("cart.product");

    const filteredCart = user.cart.filter(
      (item) => item.product && item.product.type === "physical"
    );

    if (filteredCart.length !== user.cart.length) {
      user.cart = filteredCart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      await user.save();
    }

    res.json(filteredCart);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/*ADD TO CART */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const requestedQuantity = Math.max(1, Number(quantity || 1));

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.type !== "physical") {
      return res.status(400).json({ message: "Only physical products are available" });
    }

    const user = await User.findById(req.user._id);

    const existingItem  = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      const nextQuantity = existingItem.quantity + requestedQuantity;

      if (nextQuantity > MAX_CART_ITEM_QUANTITY) {
        return res.status(400).json({
          message: `You can only add up to ${MAX_CART_ITEM_QUANTITY} units of a single product`
        });
      }

      existingItem.quantity = nextQuantity;
    } else {
      if (requestedQuantity > MAX_CART_ITEM_QUANTITY) {
        return res.status(400).json({
          message: `You can only add up to ${MAX_CART_ITEM_QUANTITY} units of a single product`
        });
      }

      user.cart.push({
        product: productId,
        quantity: requestedQuantity
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

    if (quantity > MAX_CART_ITEM_QUANTITY) {
      return res.status(400).json({
        message: `Quantity cannot exceed ${MAX_CART_ITEM_QUANTITY}`
      });
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
