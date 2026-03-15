import express from "express";
import { uploadProductImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin upload: product image
router.post("/image", protect, adminOnly, uploadProductImage);

export default router;
