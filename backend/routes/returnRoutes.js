import express from "express";
import {
  createReturn,
  getMyReturns,
  getReturnByOrder,
  getAllReturns,
  updateReturnStatus,
  updateReturnNote
} from "../controllers/returnController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// User Routes
router.post("/", protect, createReturn);
router.get("/my", protect, getMyReturns);
router.get("/order/:orderId", protect, getReturnByOrder);

// Admin Routes
router.get("/admin/all", protect, adminOnly, getAllReturns);
router.put("/admin/:id/status", protect, adminOnly, updateReturnStatus);
router.put("/admin/:id/note", protect, adminOnly, updateReturnNote);

export default router;
