import User from "../models/User.js";
import bcrypt from "bcryptjs";

/* -------- GET PROFILE -------- */

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;

    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (photo) user.photo = photo;

    await user.save();

    res.json({
      message: "Profile updated",
      name: user.name,
      email: user.email,
      photo: user.photo
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(user.addresses);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country
    } = req.body;

    const user = await User.findById(req.user._id);

    user.addresses.push({
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      country
    });

    await user.save();

    res.status(201).json({
      message: "Address added",
      addresses: user.addresses
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      address => address._id.toString() !== id
    );

    await user.save();

    res.json({ message: "Address deleted" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
