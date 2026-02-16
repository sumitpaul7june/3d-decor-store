import express from "express";
import {
  createOrder,
  markOrderAsPaid,
  cancelOrder,
  getMyOrders,
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

// Pay order (online payment demo)
router.put("/:id/pay", protect, markOrderAsPaid);

// Cancel order (if still placed)
router.put("/:id/cancel", protect, cancelOrder);


/* -------- ADMIN ROUTES -------- */

// Get all orders
router.get("/", protect, adminOnly, getAllOrders);

// Update order status (Shipped, Delivered etc.)
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
