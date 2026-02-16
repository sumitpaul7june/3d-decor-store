import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js'

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });

    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
}

export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({ message: "Logged out successfully" });
};

/* ---------- GOOGLE LOGIN ---------- */
export const googleLogin = async (req, res) => {
  try {
    const { name, email, googleId, photo } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });

    // If user does not exist → create
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        photo
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
