import express from "express";
import { uploadProductImage, uploadStlFile } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Admin upload: product image
router.post("/image", protect, adminOnly, uploadProductImage);

// Admin upload: STL file
router.post("/stl", protect, adminOnly, uploadStlFile);

export default router;
