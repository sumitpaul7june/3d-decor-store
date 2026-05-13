import crypto from "crypto";

// Check if Cloudinary env variables exist.
const hasCloudinaryEnv = () => {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
};

// Create Cloudinary signature from folder + public id + timestamp.
const createCloudinarySignature = (folder, publicId, timestamp) => {
  const stringToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;

  return crypto.createHash("sha1").update(stringToSign).digest("hex");
};

// Make file name safe before using it inside Cloudinary public id.
const getSafeFileName = (fileName = "file") => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return safeName || "file";
};

// Reusable function that uploads a base64 file to Cloudinary.
const uploadToCloudinary = async (fileDataUrl, fileName, folder, resourceType) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${folder}/${getSafeFileName(fileName)}-${Date.now()}`;
  const signature = createCloudinarySignature(folder, publicId, timestamp);

  const formData = new FormData();
  formData.append("file", fileDataUrl);
  formData.append("api_key", process.env.CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const cloudinaryResponse = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData
  });

  const cloudinaryData = await cloudinaryResponse.json();

  if (!cloudinaryResponse.ok) {
    throw new Error(cloudinaryData?.error?.message || "Cloudinary upload failed");
  }

  return {
    url: cloudinaryData.secure_url,
    publicId: cloudinaryData.public_id,
    originalName: fileName || cloudinaryData.original_filename || "file"
  };
};

// Upload product image (admin-only route).
export const uploadProductImage = async (req, res) => {
  try {
    if (!hasCloudinaryEnv()) {
      return res.status(500).json({ message: "Cloudinary env variables are missing" });
    }

    const { fileDataUrl, fileName } = req.body;

    // Accept only image data URL format.
    if (!fileDataUrl || !/^data:image\/[^;]+;base64,/.test(fileDataUrl)) {
      return res.status(400).json({ message: "Valid image data is required" });
    }

    const uploaded = await uploadToCloudinary(
      fileDataUrl,
      fileName,
      "products/images",
      "image"
    );

    return res.status(201).json(uploaded);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Upload failed" });
  }
};

// Upload general media (supports video and images up to 50MB, admin-only).
export const uploadMedia = async (req, res) => {
  try {
    if (!hasCloudinaryEnv()) {
      return res.status(500).json({ message: "Cloudinary env variables are missing" });
    }

    const { fileDataUrl, fileName } = req.body;

    if (!fileDataUrl || !/^data:(image|video)\/[^;]+;base64,/.test(fileDataUrl)) {
      return res.status(400).json({ message: "Valid media data (image or video) is required" });
    }

    const uploaded = await uploadToCloudinary(
      fileDataUrl,
      fileName,
      "storefront/media",
      "auto"
    );

    return res.status(201).json(uploaded);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Upload failed" });
  }
};
