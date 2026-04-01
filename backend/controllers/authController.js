import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+[\]{};:'",.<>/\\|`~]).{8,}$/;

const cookieOptions = {
  httpOnly: true,
  secure: false, // true in production with HTTPS
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v1/certs";

const verifyGoogleCredential = async (credential) => {
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim();

  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const decodedToken = jwt.decode(credential, { complete: true });
  const keyId = decodedToken?.header?.kid;

  if (!keyId) {
    throw new Error("Invalid Google credential");
  }

  const certsResponse = await fetch(GOOGLE_CERTS_URL);

  if (!certsResponse.ok) {
    throw new Error("Failed to fetch Google signing certificates");
  }

  const certs = await certsResponse.json();
  const signingKey = certs[keyId];

  if (!signingKey) {
    throw new Error("Google signing key not found");
  }

  const payload = jwt.verify(credential, signingKey, {
    algorithms: ["RS256"],
    audience: googleClientId,
    issuer: ["accounts.google.com", "https://accounts.google.com"]
  });

  const isEmailVerified =
    payload?.email_verified === true || payload?.email_verified === "true";

  if (!payload?.email || !isEmailVerified) {
    throw new Error("Google account email is not verified");
  }

  return payload;
};

const buildLoginTracking = (count = 0) => ({
  loginCount: count + 1,
  lastLoginAt: new Date()
});

export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars and include uppercase, lowercase, number, and special character"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      ...buildLoginTracking()
    });

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Prevent bcrypt compare crash when account has no password.
    if (!user.password) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    Object.assign(user, buildLoginTracking(user.loginCount));
    await user.save();

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    const message = error?.message || "Google authentication failed";
    const isExpectedGoogleError =
      message.includes("Google") ||
      message.includes("credential") ||
      message.includes("email") ||
      message.includes("configured") ||
      message.includes("signing key");

    return res.status(isExpectedGoogleError ? 400 : 500).json({ message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({ message: "Logged out successfully" });
};

export const googleLogin = async (req, res) => {
  try {
    const credential = req.body.credential || "";

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const googleUser = await verifyGoogleCredential(credential);

    let name = (googleUser.name || "").trim();
    let email = (googleUser.email || "").trim().toLowerCase();
    let googleId = googleUser.sub;
    let photo = googleUser.picture || "";
    email = (email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        photo,
        ...buildLoginTracking()
      });
    } else {
      if (user.googleId && user.googleId !== googleId) {
        return res.status(400).json({
          message: "This email is already linked to a different Google account"
        });
      }

      user.googleId = googleId;
      user.photo = photo || user.photo;
      user.name = user.name || name;
      Object.assign(user, buildLoginTracking(user.loginCount));
      await user.save();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || "").trim();
    const emailUser = (process.env.EMAIL || "").trim();
    const emailPass = (process.env.EMAIL_PASS || "").trim();

    if (!frontendUrl) {
      return res.status(500).json({ message: "FRONTEND_URL is not configured" });
    }

    if (!emailUser || !emailPass) {
      return res.status(500).json({ message: "Email service is not configured" });
    }

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Link",
      html: `
        <p>You requested password reset</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    res.status(200).json({ message: "Reset link sent to email" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to send reset link"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const password = req.body.password || "";

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 chars and include uppercase, lowercase, number, and special character"
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message || "Failed to reset password" });
  }
};
