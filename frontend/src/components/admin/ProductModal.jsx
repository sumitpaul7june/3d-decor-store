// Modal form for adding or editing a product in the admin UI.
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./ProductModal.css";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

function ProductModal({ isOpen, onClose, onSave, initialData }) {
  // Controlled form state for create/edit product.
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "stl",
    category: "lighting",
    price: "",
    originalPrice: "",
    imageUrls: [],
    stlImageUrl: "",
    stlFile: ""
  });
  // Form-level error message shown near inputs.
  const [formError, setFormError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    // Pre-fill form when editing an existing product.
    // Also reset fields each time modal opens.
    const initialImages = Array.isArray(initialData?.images)
      ? initialData.images
      : initialData?.image
        ? [initialData.image]
        : [];

    setForm({
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "stl",
      category: initialData?.category || "lighting",
      price: initialData?.price || "",
      originalPrice: initialData?.originalPrice || "",
      imageUrls:
        (initialData?.type || "stl") === "physical" ? initialImages.slice(0, 4) : [],
      stlImageUrl:
        (initialData?.type || "stl") === "stl" ? initialImages[0] || "" : "",
      stlFile: initialData?.stlFile || ""
    });
    setFormError("");
    setImageUploading(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    // Generic handler for text/select/number inputs.
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === "type" && value === "physical") {
        return {
          ...prev,
          type: value,
          imageUrls:
            prev.imageUrls.length > 0
              ? prev.imageUrls
              : prev.stlImageUrl.trim()
                ? [prev.stlImageUrl.trim()]
                : []
        };
      }

      if (name === "type" && value === "stl") {
        return {
          ...prev,
          type: value,
          imageUrls: []
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const uploadFileToBackend = async (file, endpoint) => {
    const fileDataUrl = await readFileAsDataUrl(file);
    const { data } = await axios.post(endpoint, {
      fileDataUrl,
      fileName: file.name
    });
    return data;
  };

  const handleImageFileChange = (e) => {
    // Read uploaded image and send to backend upload endpoint.
    const uploadImage = async () => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const currentCount = form.imageUrls.length;
      const remainingSlots = 4 - currentCount;

      if (remainingSlots <= 0) {
        setFormError("Maximum 4 images allowed");
        return;
      }

      try {
        setImageUploading(true);
        setFormError("");

        const validImageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (!validImageFiles.length) {
          setFormError("Please upload valid image files");
          return;
        }

        const filesToUpload = validImageFiles.slice(0, remainingSlots);

        const uploadedResults = await Promise.all(
          filesToUpload.map((file) => uploadFileToBackend(file, "/upload/image"))
        );

        const uploadedUrls = uploadedResults
          .map((result) => result?.url)
          .filter(Boolean);

        setForm((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls].slice(0, 4)
        }));

        if (validImageFiles.length > filesToUpload.length) {
          setFormError("Only first 4 images are kept per product");
        }
      } catch (error) {
        setFormError(error.response?.data?.message || "Image upload failed");
      } finally {
        setImageUploading(false);
        e.target.value = "";
      }
    };

    uploadImage();
  };

  const handleRemoveImage = (indexToRemove) => {
    // Allow admin to delete/replace already uploaded images while editing.
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.type === "physical") {
      if (!Array.isArray(form.imageUrls) || form.imageUrls.length === 0) {
        setFormError("At least one product image is required");
        return;
      }

      if (form.imageUrls.length > 4) {
        setFormError("Maximum 4 images allowed");
        return;
      }
    }

    if (form.type === "stl") {
      if (!form.stlImageUrl.trim()) {
        setFormError("Cover image URL is required for STL product");
        return;
      }

      if (!form.stlFile.trim()) {
        setFormError("STL file URL is required for STL product");
        return;
      }
    }

    const payload = {
      // Build payload in backend product schema.
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      category: form.category.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      images:
        form.type === "physical"
          ? form.imageUrls
          : [form.stlImageUrl.trim()]
    };

    if (form.type === "stl") {
      // STL products use manual file URL for now.
      payload.stlFile = form.stlFile.trim();
      payload.stlFilePublicId = "";
      payload.stlFileOriginalName = "";
    }

    onSave(payload);
    onClose();
  };

  const currentPrice = Number(form.price || 0);
  const originalPrice = Number(form.originalPrice || 0);
  const discountPercent =
    originalPrice > 0 && currentPrice > 0 && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return (
    // Clicking dark overlay closes modal.
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop overlay close when clicking inside modal panel. */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header section */}
        <div className="modal-head">
          <div>
            <p className="modal-kicker">Catalog</p>
            <h2>{initialData ? "Edit Product" : "Add Product"}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Product form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid modal-grid-2">
            <label htmlFor="name">
              Name
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label htmlFor="category">
              Category
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label htmlFor="description">
            Description
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <div className="modal-grid modal-grid-2">
            <label htmlFor="type">
              Type
              <select
                name="type"
                id="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="stl">STL</option>
                <option value="physical">Physical</option>
              </select>
            </label>

            {form.type === "physical" ? (
              <label htmlFor="imageFile">
                Product Images (max 4)
                <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                />
                <span className="modal-helper-text">
                  {imageUploading
                    ? "Uploading image(s)..."
                    : `${form.imageUrls.length}/4 uploaded`}
                </span>
              </label>
            ) : (
              <label htmlFor="stlImageUrl">
                Cover Image URL
                <input
                  id="stlImageUrl"
                  name="stlImageUrl"
                  value={form.stlImageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </label>
            )}
          </div>

          {formError && <p className="modal-form-error">{formError}</p>}

          <div className="modal-grid modal-grid-2">
            <label htmlFor="price">
              Price
              <input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label htmlFor="originalPrice">
              Original Price
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                value={form.originalPrice}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {!!discountPercent && (
            // Real-time discount hint for admin while editing prices.
            <p className="modal-discount-chip">
              Discount: {discountPercent}% off
            </p>
          )}

          {form.type === "stl" && (
            <label htmlFor="stlFile">
              STL File URL
              <input
                id="stlFile"
                name="stlFile"
                value={form.stlFile}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
              <span className="modal-helper-text">
                STL upload will be added later. Use hosted URL for now.
              </span>
            </label>
          )}

          {form.type === "physical" && form.imageUrls.length > 0 && (
            // Image preview grid to manage multiple product images.
            <div className="modal-preview">
              <p>Image Preview ({form.imageUrls.length}/4)</p>
              <div className="modal-preview-grid">
                {form.imageUrls.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="modal-preview-item">
                    <img
                      src={imageUrl}
                      alt={`Product preview ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      className="modal-remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type === "stl" && form.stlImageUrl.trim() && (
            <div className="modal-preview">
              <p>Cover Image Preview</p>
              <img
                src={form.stlImageUrl}
                alt="STL cover preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={imageUploading}>
              {initialData ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
