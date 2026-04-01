import User from "../models/User.js";

// Validate and sanitize address payload coming from frontend.
const validateAddressInput = (payload = {}) => {
  const errors = {};

  const fullName = (payload.fullName || "").trim();
  const phone = (payload.phone || "").trim();
  const addressLine = (payload.addressLine || "").trim();
  const city = (payload.city || "").trim();
  const state = (payload.state || "").trim();
  const pincode = (payload.pincode || "").trim();
  const country = (payload.country || "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required";
  } else if (fullName.length < 2 || fullName.length > 80) {
    errors.fullName = "Full name must be between 2 and 80 characters";
  }

  const normalizedPhone = phone.replace(/[^\d+]/g, "");
  if (!phone) {
    errors.phone = "Phone number is required";
  } else if (!/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
    errors.phone = "Phone must be 7 to 15 digits (optional + prefix)";
  }

  if (!addressLine) {
    errors.addressLine = "Address line is required";
  } else if (addressLine.length < 5 || addressLine.length > 200) {
    errors.addressLine = "Address line must be between 5 and 200 characters";
  }

  if (!city) {
    errors.city = "City is required";
  } else if (!/^[a-zA-Z\s.'-]{2,80}$/.test(city)) {
    errors.city = "City can contain only letters and spaces";
  }

  if (state && !/^[a-zA-Z\s.'-]{2,80}$/.test(state)) {
    errors.state = "State can contain only letters and spaces";
  }

  if (!pincode) {
    errors.pincode = "Pincode is required";
  } else if (!/^[a-zA-Z0-9\s-]{3,12}$/.test(pincode)) {
    errors.pincode = "Pincode format is invalid";
  }

  if (!country) {
    errors.country = "Country is required";
  } else if (!/^[a-zA-Z\s.'-]{2,80}$/.test(country)) {
    errors.country = "Country can contain only letters and spaces";
  }

  return {
    errors,
    data: {
      fullName,
      phone: normalizedPhone,
      addressLine,
      city,
      state,
      pincode,
      country
    }
  };
};

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

export const getAllUsersAdmin = async (_req, res) => {
  try {
    const users = await User.find()
      .select("name email role photo googleId loginCount lastLoginAt createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
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
    const { errors, data } = validateAddressInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Address validation failed",
        errors
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push({
      fullName: data.fullName,
      phone: data.phone,
      addressLine: data.addressLine,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country
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
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      address => address._id.toString() !== id
    );

    await user.save();

    res.json({ message: "Address deleted" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
