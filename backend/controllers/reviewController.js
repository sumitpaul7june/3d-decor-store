import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Recalculates and caches the average rating on the Product document
const updateProductRatingCache = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

/* ---------- CREATE OR UPDATE REVIEW ---------- */
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    // Verify the user has purchased this product
    const hasBought = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      orderStatus: { $ne: "Cancelled" }
    });

    if (!hasBought) {
      return res.status(403).json({ message: "You must purchase this item before leaving a review." });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      // Update existing
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      // Create new
      await Review.create({
        product: productId,
        user: req.user._id,
        rating: Number(rating),
        comment,
      });
    }

    // Recalculate and update the Product caching
    await updateProductRatingCache(productId);

    res.status(201).json({ message: "Review saved successfully" });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ---------- GET REVIEWS FOR PRODUCT ---------- */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(15);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ---------- GET USER REVIEW FOR PRODUCT ---------- */
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const review = await Review.findOne({ product: productId, user: req.user._id });
    res.json(review || {});
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ---------- DELETE REVIEW ---------- */
export const deleteReview = async (req, res) => {
  try {
    const { productId } = req.params;
    await Review.findOneAndDelete({ product: productId, user: req.user._id });
    await updateProductRatingCache(productId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
