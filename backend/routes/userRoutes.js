import express from "express";
import {
  getProfile,
  getAllUsersAdmin,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* -------- PROFILE -------- */

// Get all users for admin dashboard/user management
router.get("/admin/all", protect, adminOnly, getAllUsersAdmin);

// Get logged-in user profile
router.get("/profile", protect, getProfile);

// Update profile
router.put("/profile", protect, updateProfile);


/* -------- ADDRESS -------- */

// Get all addresses
router.get("/address", protect, getAddresses);

// Add new address
router.post("/address", protect, addAddress);

// Delete address
router.delete("/address/:id", protect, deleteAddress);

/* -------- WISHLIST -------- */

router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, toggleWishlist);

export default router;
