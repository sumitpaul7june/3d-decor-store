import express from "express";
const router = express.Router();

import {
    createOrder,
    verifyPayment,
    markPaymentFailed
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/mark-failed", protect, markPaymentFailed);

export default router;
