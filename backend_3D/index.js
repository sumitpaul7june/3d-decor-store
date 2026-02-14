import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

/* -------- CONNECT DATABASE -------- */
connectDB();

const app = express();

/* -------- MIDDLEWARE -------- */

// CORS (important for cookies)
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true
}));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

/* -------- ROUTES -------- */

app.use("/api/auth", authRoutes);

//` Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

import { protect } from "./middleware/authMiddleware.js";

app.get("/api/test-protected", protect, (req, res) => {
  res.json({
    message: "Protected route working ✅",
    user: req.user
  });
});
import { adminOnly } from "./middleware/adminMiddleware.js";

app.get("/api/test-admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin route working 👑" });
});

import productRoutes from "./routes/productRoutes.js";

app.use("/api/products", productRoutes);
import cartRoutes from "./routes/cartRoutes.js";

app.use("/api/cart", cartRoutes);
import orderRoutes from "./routes/orderRoutes.js";

app.use("/api/orders", orderRoutes);

/* -------- SERVER -------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
