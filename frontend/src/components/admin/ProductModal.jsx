// Modal form for adding or editing a physical product with separate cover and gallery media.
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
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "lighting",
    price: "",
    originalPrice: "",
    coverImage: "",
    galleryImages: []
  });
  const [formError, setFormError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    const initialGallery = Array.isArray(initialData?.images)
      ? initialData.images
      : initialData?.image
        ? [initialData.image]
        : [];

    setForm({
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "lighting",
      price: initialData?.price || "",
      originalPrice: initialData?.originalPrice || "",
      coverImage: initialData?.coverImage || "",
      galleryImages: initialGallery.slice(0, 4)
    });
    setFormError("");
    setCoverUploading(false);
    setGalleryUploading(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFileToBackend = async (file) => {
    const fileDataUrl = await readFileAsDataUrl(file);
    const { data } = await axios.post("/upload/image", {
      fileDataUrl,
      fileName: file.name
    });
    return data?.url || "";
  };

  const handleCoverFileChange = (e) => {
    const uploadCover = async () => {
      const file = Array.from(e.target.files || [])[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setFormError("Please upload a valid cover image");
        e.target.value = "";
        return;
      }

      try {
        setCoverUploading(true);
        setFormError("");
        const imageUrl = await uploadFileToBackend(file);

        setForm((prev) => ({
          ...prev,
          coverImage: imageUrl
        }));
      } catch (error) {
        setFormError(error.response?.data?.message || "Listing image upload failed");
      } finally {
        setCoverUploading(false);
        e.target.value = "";
      }
    };

    uploadCover();
  };

  const handleGalleryFileChange = (e) => {
    const uploadGallery = async () => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const currentCount = form.galleryImages.length;
      const remainingSlots = 4 - currentCount;

      if (remainingSlots <= 0) {
        setFormError("Maximum 4 gallery images allowed");
        return;
      }

      try {
        setGalleryUploading(true);
        setFormError("");

        const validImageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (!validImageFiles.length) {
          setFormError("Please upload valid gallery image files");
          return;
        }

        const filesToUpload = validImageFiles.slice(0, remainingSlots);
        const uploadedUrls = (
          await Promise.all(filesToUpload.map((file) => uploadFileToBackend(file)))
        ).filter(Boolean);

        setForm((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...uploadedUrls].slice(0, 4)
        }));

        if (validImageFiles.length > filesToUpload.length) {
          setFormError("Only the first 4 gallery images were added");
        }
      } catch (error) {
        setFormError(error.response?.data?.message || "Gallery upload failed");
      } finally {
        setGalleryUploading(false);
        e.target.value = "";
      }
    };

    uploadGallery();
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleRemoveCover = () => {
    setForm((prev) => ({
      ...prev,
      coverImage: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.coverImage) {
      setFormError("A listing image is required");
      return;
    }

    if (!Array.isArray(form.galleryImages) || form.galleryImages.length === 0) {
      setFormError("At least one gallery image is required");
      return;
    }

    if (form.galleryImages.length > 4) {
      setFormError("Maximum 4 gallery images allowed");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: "physical",
      category: form.category.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      coverImage: form.coverImage,
      images: form.galleryImages
    };

    const didSave = await onSave(payload);

    if (didSave !== false) {
      onClose();
    }
  };

  const currentPrice = Number(form.price || 0);
  const originalPrice = Number(form.originalPrice || 0);
  const discountPercent =
    originalPrice > 0 && currentPrice > 0 && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const handleDescriptionKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.description;
      const selectedText = text.substring(start, end);

      const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);

      setForm((prev) => ({ ...prev, description: newText }));

      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(start + 2, end + 2);
        } else {
          textarea.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              onKeyDown={handleDescriptionKeyDown}
              rows={3}
            />
          </label>

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
            <p className="modal-discount-chip">
              Discount: {discountPercent}% off
            </p>
          )}

          <div className="modal-media-section">
            <div className="modal-section-head">
              <div>
                <p className="modal-section-kicker">Product Listing Media</p>
                <h3>Listing Image</h3>
              </div>
              <label htmlFor="coverFile" className="modal-upload-btn">
                {coverUploading ? "Uploading..." : "Upload Listing Image"}
              </label>
            </div>

            <p className="modal-section-note">
              Used for product cards, listing pages, and admin previews. This is not the homepage-wide banner.
            </p>

            <input
              id="coverFile"
              name="coverFile"
              type="file"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="modal-hidden-input"
            />

            <div className="modal-cover-preview">
              {form.coverImage ? (
                <>
                  <img src={form.coverImage} alt="Listing image preview" />
                  <button
                    type="button"
                    className="modal-remove-image-btn"
                    onClick={handleRemoveCover}
                  >
                    Remove Listing Image
                  </button>
                </>
              ) : (
                <div className="modal-empty-state">
                  <strong>No listing image selected</strong>
                  <span>Upload one clean image for cards and collection grids.</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-media-section">
            <div className="modal-section-head">
              <div>
                <p className="modal-section-kicker">Product Detail Media</p>
                <h3>Product Gallery</h3>
              </div>
              <label htmlFor="galleryFile" className="modal-upload-btn">
                {galleryUploading ? "Uploading..." : "Upload Gallery"}
              </label>
            </div>

            <p className="modal-section-note">
              Used only on the product detail page. Add up to 4 supporting product images.
            </p>

            <input
              id="galleryFile"
              name="galleryFile"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryFileChange}
              className="modal-hidden-input"
            />

            <div className="modal-gallery-meta">
              <span>{form.galleryImages.length}/4 uploaded</span>
            </div>

            {form.galleryImages.length > 0 ? (
              <div className="modal-preview-grid">
                {form.galleryImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="modal-preview-item">
                    <img
                      src={imageUrl}
                      alt={`Gallery preview ${index + 1}`}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      className="modal-remove-image-btn"
                      onClick={() => handleRemoveGalleryImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="modal-empty-state">
                <strong>No gallery images added</strong>
                <span>Upload close-up or alternate views for the product detail page.</span>
              </div>
            )}
          </div>

          {formError && <p className="modal-form-error">{formError}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={coverUploading || galleryUploading}>
              {initialData ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
