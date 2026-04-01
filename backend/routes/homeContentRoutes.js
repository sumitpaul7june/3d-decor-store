import express from "express";
import {
  getHomeContent,
  upsertHomeContent
} from "../controllers/homeContentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public storefront can read homepage content.
router.get("/", getHomeContent);

// Admin can update the singleton home page content record.
router.put("/", protect, adminOnly, upsertHomeContent);

export default router;
