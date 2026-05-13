import express from "express";
import { createReview, getProductReviews, getUserReview, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:productId", getProductReviews);
router.get("/user/:productId", protect, getUserReview);
router.post("/:productId", protect, createReview);
router.delete("/:productId", protect, deleteReview);

export default router;
