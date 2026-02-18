import express from "express";
import {
  createOrder,
  markOrderAsPaid,
  cancelOrder,
  getMyOrders,
  downloadOrderStl,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* -------- USER ROUTES -------- */

// Create order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

// Download STL file for a purchased order item
router.get("/:orderId/items/:itemId/download", protect, downloadOrderStl);

// Pay order (kept for future payment integration)
router.put("/:id/pay", protect, markOrderAsPaid);

// Cancel order (if still placed)
router.put("/:id/cancel", protect, cancelOrder);


/* -------- ADMIN ROUTES -------- */

// Get all orders
router.get("/", protect, adminOnly, getAllOrders);

// Update order status (Shipped, Delivered etc.)
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
