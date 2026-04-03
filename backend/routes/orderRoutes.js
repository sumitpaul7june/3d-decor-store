import express from "express";
import {
  createOrder,
  markOrderAsPaid,
  cancelOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateAdminOrderNote
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* -------- USER ROUTES -------- */

// Create order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

// Pay order (kept for future payment integration)
router.put("/:id/pay", protect, markOrderAsPaid);

// Cancel order (if still placed)
router.put("/:id/cancel", protect, cancelOrder);


/* -------- ADMIN ROUTES -------- */

// Get all orders
router.get("/", protect, adminOnly, getAllOrders);

// Get one order with full details
router.get("/:id", protect, adminOnly, getAdminOrderById);

// Update order status (Shipped, Delivered etc.)
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/admin-note", protect, adminOnly, updateAdminOrderNote);

export default router;
