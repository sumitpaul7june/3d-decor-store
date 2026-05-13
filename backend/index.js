import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import homeContentRoutes from "./routes/homeContentRoutes.js";
import storePolicyRoutes from "./routes/storePolicyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; 
import returnRoutes from "./routes/returnRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import { protect } from "./middleware/authMiddleware.js";
import { adminOnly } from "./middleware/adminMiddleware.js";


/* -------- CONNECT DATABASE -------- */
connectDB();

const app = express();
app.set("trust proxy", 1);

/* -------- MIDDLEWARE -------- */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Larger limit allows base64 payloads for product image uploads.
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

/* -------- ROUTES -------- */

app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/home-content", homeContentRoutes);
app.use("/api/store-policies", storePolicyRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", reviewRoutes);

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
