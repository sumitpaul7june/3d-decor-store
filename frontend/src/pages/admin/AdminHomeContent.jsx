import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./AdminHomeContent.css";

const createEmptySlide = () => ({
  image: "",
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaLink: "/products"
});

const normalizeSlides = (slides = []) => {
  const safeSlides = Array.isArray(slides)
    ? slides.slice(0, 3).map((slide) => ({
        image: slide?.image || "",
        title: slide?.title || "",
        subtitle: slide?.subtitle || "",
        ctaLabel: slide?.ctaLabel || "",
        ctaLink: slide?.ctaLink || "/products"
      }))
    : [];

  while (safeSlides.length < 3) {
    safeSlides.push(createEmptySlide());
  }

  return safeSlides;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

function AdminHomeContent() {
  const [form, setForm] = useState({ heroSlides: normalizeSlides() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get("/home-content");

      setForm({
        heroSlides: normalizeSlides(data?.heroSlides || [])
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load home content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const handleSlideChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((slide, slideIndex) =>
        slideIndex === index
          ? { ...slide, [field]: value }
          : slide
      )
    }));
    setSuccess("");
  };

  const handleBannerUpload = async (index, event) => {
    const file = Array.from(event.target.files || [])[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid banner image");
      event.target.value = "";
      return;
    }

    try {
      setUploadingIndex(index);
      setError("");
      setSuccess("");

      const fileDataUrl = await readFileAsDataUrl(file);
      const { data } = await axios.post("/upload/image", {
        fileDataUrl,
        fileName: file.name
      });

      handleSlideChange(index, "image", data?.url || "");
    } catch (err) {
      setError(err.response?.data?.message || "Banner upload failed");
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const handleRemoveBanner = (index) => {
    setForm((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((slide, slideIndex) =>
        slideIndex === index
          ? createEmptySlide()
          : slide
      )
    }));
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const heroSlides = form.heroSlides
      .map((slide) => ({
        image: slide.image.trim(),
        title: slide.title.trim(),
        subtitle: slide.subtitle.trim(),
        ctaLabel: slide.ctaLabel.trim(),
        ctaLink: slide.ctaLink.trim() || "/products"
      }))
      .filter((slide) => slide.image);

    if (!heroSlides.length) {
      setError("Please upload at least 1 homepage banner");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axios.put("/home-content", { heroSlides });

      setSuccess("Homepage carousel updated");
      setForm({ heroSlides: normalizeSlides(heroSlides) });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save home content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-home-content">
      <div className="admin-home-content__head">
        <div>
          <p className="admin-home-content__kicker">Storefront</p>
          <h1 className="admin-home-content__title">Home Content</h1>
          <p className="admin-home-content__subtitle">
            Add up to 3 wide homepage banners. Product listing images still stay attached to individual products.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-home-content__panel">
          <p className="admin-home-content__status">Loading home content...</p>
        </div>
      ) : (
        <form className="admin-home-content__grid" onSubmit={handleSubmit}>
          <div className="admin-home-content__slides">
            {form.heroSlides.map((slide, index) => (
              <section key={`hero-slide-${index}`} className="admin-home-content__panel">
                <div className="admin-home-content__panel-head">
                  <div>
                    <p className="admin-home-content__panel-kicker">Homepage Slide {index + 1}</p>
                    <h2 className="admin-home-content__panel-title">Wide Cover Banner</h2>
                  </div>
                  <label
                    htmlFor={`heroBannerFile-${index}`}
                    className="admin-home-content__upload-btn"
                  >
                    {uploadingIndex === index ? "Uploading..." : "Upload Banner"}
                  </label>
                </div>

                <input
                  id={`heroBannerFile-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleBannerUpload(index, event)}
                  className="admin-home-content__hidden-input"
                />

                {slide.image ? (
                  <div className="admin-home-content__banner-preview">
                    <img src={slide.image} alt={`Homepage banner ${index + 1}`} />
                    <button
                      type="button"
                      className="admin-home-content__secondary-btn"
                      onClick={() => handleRemoveBanner(index)}
                    >
                      Remove Banner
                    </button>
                  </div>
                ) : (
                  <div className="admin-home-content__empty-state">
                    <strong>No banner added yet</strong>
                    <span>Upload a wide cover image for slide {index + 1}.</span>
                  </div>
                )}

                <div className="admin-home-content__field-grid">
                  <label>
                    Title
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(event) => handleSlideChange(index, "title", event.target.value)}
                      placeholder="Elevated decor for thoughtful homes"
                    />
                  </label>

                  <label>
                    Button Label
                    <input
                      type="text"
                      value={slide.ctaLabel}
                      onChange={(event) => handleSlideChange(index, "ctaLabel", event.target.value)}
                      placeholder="Shop Now"
                    />
                  </label>
                </div>

                <label>
                  Subtitle
                  <textarea
                    rows={4}
                    value={slide.subtitle}
                    onChange={(event) => handleSlideChange(index, "subtitle", event.target.value)}
                    placeholder="Add supporting copy for this homepage banner."
                  />
                </label>

                <label>
                  Button Link
                  <input
                    type="text"
                    value={slide.ctaLink}
                    onChange={(event) => handleSlideChange(index, "ctaLink", event.target.value)}
                    placeholder="/products"
                  />
                </label>

                <p className="admin-home-content__slot-note">
                  {slide.image
                    ? "This slide is ready for the homepage carousel."
                    : "Optional slot. Leave it empty if you want fewer than 3 banners."}
                </p>
              </section>
            ))}
          </div>

          {(error || success) && (
            <div className="admin-home-content__messages">
              {error && <p className="admin-home-content__error">{error}</p>}
              {success && <p className="admin-home-content__success">{success}</p>}
            </div>
          )}

          <div className="admin-home-content__actions">
            <button
              type="button"
              className="admin-home-content__secondary-btn"
              onClick={fetchHomeContent}
              disabled={saving || uploadingIndex !== null}
            >
              Reset
            </button>
            <button
              type="submit"
              className="admin-home-content__primary-btn"
              disabled={saving || uploadingIndex !== null}
            >
              {saving ? "Saving..." : "Save Home Content"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AdminHomeContent;
