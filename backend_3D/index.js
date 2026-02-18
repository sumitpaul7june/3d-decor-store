import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

import { protect } from "./middleware/authMiddleware.js";
import { adminOnly } from "./middleware/adminMiddleware.js";

dotenv.config();

/* -------- CONNECT DATABASE -------- */
connectDB();

const app = express();

/* -------- MIDDLEWARE -------- */

// CORS (important for cookies)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Larger limit allows base64 file payloads for image/STL uploads.
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

/* -------- ROUTES -------- */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

/* -------- TEST ROUTES -------- */

app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

app.get("/api/test-protected", protect, (req, res) => {
  res.json({
    message: "Protected route working ✅",
    user: req.user
  });
});

app.get("/api/test-admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin route working 👑" });
});

/* -------- SERVER -------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
