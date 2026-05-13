import express from "express";
import { uploadProductImage, uploadMedia } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin upload: product image
router.post("/image", protect, adminOnly, uploadProductImage);

// Admin upload: general media (image or video)
router.post("/media", protect, adminOnly, uploadMedia);

export default router;
