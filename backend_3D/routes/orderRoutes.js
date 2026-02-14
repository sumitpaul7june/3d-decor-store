import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* -------- USER ROUTES -------- */

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

/* -------- ADMIN ROUTES -------- */

router.get("/admin", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
