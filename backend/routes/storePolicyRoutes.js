import express from "express";
import {
  getStorePolicies,
  upsertStorePolicies
} from "../controllers/storePolicyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getStorePolicies);
router.put("/", protect, adminOnly, upsertStorePolicies);

export default router;
