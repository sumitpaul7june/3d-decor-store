// Product details page with image-first layout, cleaner purchase controls, and structured description content.
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCartFromServer } from "../store/cartSlice";
import axios from "../api/axios";
import {
  buildCartItemFromProduct,
  normalizeServerCart
} from "../utils/cartHelpers";
import { getProductPresentation } from "../utils/productPresentation";
import {
  buildProductPath,
  getProductIdFromRouteParam
} from "../utils/productRoutes";
import "./ProductDetail.css";

const parseInfoBlocks = (content = "") => {
  const lines = String(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let currentList = [];

  lines.forEach((line) => {
    const isBullet = /^[-*•]\s+/.test(line);

    if (isBullet) {
      currentList.push(line.replace(/^[-*•]\s+/, ""));
      return;
    }

    if (currentList.length > 0) {
      blocks.push({ type: "list", items: currentList });
      currentList = [];
    }

    blocks.push({ type: "paragraph", text: line });
  });

  if (currentList.length > 0) {
    blocks.push({ type: "list", items: currentList });
  }

  return blocks;
};

const normalizeLooseBoldMarkdown = (text = "") =>
  String(text)
    .replace(/(^|[\s([{])\*([^*\n][^*\n]*?)\*\*(?=[:;,.!?)}\]\s]|$)/g, "$1**$2**")
    .replace(/(^|[\s([{])\*\*([^*\n][^*\n]*?)\*(?=[:;,.!?)}\]\s]|$)/g, "$1**$2**");

const formatText = (text) => {
  if (!text) return "";

  const normalizedText = normalizeLooseBoldMarkdown(text);
  const parts = normalizedText.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const parseMarkdownHeadings = (text) => {
  if (text.startsWith("### ")) return <h3>{formatText(text.slice(4))}</h3>;
  if (text.startsWith("## ")) return <h2>{formatText(text.slice(3))}</h2>;
  if (text.startsWith("# ")) return <h1>{formatText(text.slice(2))}</h1>;
  return null;
};

const renderInfoBlocks = (content, fallback) => {
  const blocks = parseInfoBlocks(content || fallback);

  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul key={`list-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{formatText(item)}</li>
          ))}
        </ul>
      );
    }
    const heading = parseMarkdownHeadings(block.text);
    if (heading) return <div key={`paragraph-${index}`}>{heading}</div>;
    return <p key={`paragraph-${index}`}>{formatText(block.text)}</p>;
  });
};

function ProductDetail() {
  const MAX_CART_ITEM_QUANTITY = 10;
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSection, setOpenSection] = useState("description");
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storePolicies, setStorePolicies] = useState({
    shippingInfo: "",
    returnPolicy: ""
  });
  
  const [reviews, setReviews] = useState([]);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const productId = getProductIdFromRouteParam(productSlug);
        const [productResponse, policiesResponse, reviewsResponse] = await Promise.all([
          axios.get(`/products/${productId}`),
          axios.get("/store-policies").catch(() => ({ data: null })),
          axios.get(`/reviews/${productId}`).catch(() => ({ data: [] }))
        ]);

        setProduct(productResponse.data);
        setReviews(reviewsResponse.data || []);
        setStorePolicies({
          shippingInfo: policiesResponse.data?.shippingInfo || "",
          returnPolicy: policiesResponse.data?.returnPolicy || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const canonicalPath = buildProductPath(product);

    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }

    const presentation = getProductPresentation(product);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product, location.pathname, navigate]);

  const toggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  useEffect(() => {
    if (!product) return;
    const presentation = getProductPresentation(product);
    const galleryLength = presentation.gallery.length;
    if (galleryLength <= 1) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) => (prev - 1 + galleryLength) % galleryLength);
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) => (prev + 1) % galleryLength);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product]);

  if (loading) {
    return <section className="product-not-found">Loading product...</section>;
  }

  if (error || !product) {
    return (
      <section className="product-not-found">
        {error || "Product not found"}
      </section>
    );
  }

  const presentation = getProductPresentation(product);
  const gallery = presentation.gallery;
  const activeImage = gallery[selectedImageIndex] || presentation.featuredImage;
  const originalPrice = product.originalPrice || product.price;
  const savings = Math.max(originalPrice - product.price, 0);
  const shippingInfo =
    storePolicies.shippingInfo ||
    "Ships within 3-5 business days with secure packaging for premium decor pieces.\n- Delivery available across India\n- Transit-safe packaging included\n- Delivery updates shared once your order is dispatched";
  const returnPolicy =
    storePolicies.returnPolicy ||
    "Returns are accepted within 7 days for unused pieces in original condition.\n- Replacement support is available for transit damage\n- Custom or final-sale pieces can be marked non-returnable\n- Reach our concierge team for return assistance";

  const showAddedFeedback = () => {
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 900);
  };

  const syncCart = async () => {
    if (!isAuthenticated) {
      dispatch(addToCart(buildCartItemFromProduct(product, quantity)));
      showAddedFeedback();
      return;
    }

    await axios.post("/cart/add", {
      productId: product._id,
      quantity
    });

    const { data } = await axios.get("/cart");
    dispatch(setCartFromServer(normalizeServerCart(data)));
    showAddedFeedback();
  };

  const handleAddToCart = async () => {
    try {
      await syncCart();
    } catch (err) {
      console.error("Add to cart failed:", err.response?.data?.message || err.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      await syncCart();
      navigate("/checkout/address");
    } catch (err) {
      console.error("Buy now failed:", err.response?.data?.message || err.message);
    }
  };



  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % gallery.length);
  };



  return (
    <section className="product-detail">
      <div className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pd-grid">
        <div className="pd-media-column">
          <div className="pd-main-stage">
            {gallery.length > 1 && (
              <button className="pd-gallery-nav prev" onClick={handlePrevImage}>
                ‹
              </button>
            )}

            <div
              className="pd-image-track"
              style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
            >
              {gallery.map((imgSrc, index) => (
                <img
                  key={`${imgSrc}-${index}`}
                  src={imgSrc}
                  alt={`${product.name} - View ${index + 1}`}
                  className="pd-main-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/900x1080?text=Image+Unavailable";
                  }}
                />
              ))}
            </div>

            {gallery.length > 1 && (
              <button className="pd-gallery-nav next" onClick={handleNextImage}>
                ›
              </button>
            )}
          </div>

          <div className="pd-thumbnails">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                className={`pd-thumbnail ${index === selectedImageIndex ? "active" : ""}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={image} alt={`${product.name} preview ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <p className="pd-collection">{presentation.categoryLabel}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <span className="pd-stars">★ {product.averageRating || 0}</span>
            <span>({product.numReviews || 0} reviews) • {presentation.trustNote}</span>
          </div>

          <div className="pd-price-row">
            <div className="pd-price-block">
              {originalPrice > product.price && (
                <span className="pd-original">₹{originalPrice}</span>
              )}
              <span className="pd-current">₹{product.price}</span>
              {savings > 0 && (
                <span className="pd-save-chip">SAVE ₹{savings.toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>

          <p className="pd-tax-note">Inclusive of all taxes. Ships across India.</p>

          <div className="pd-actions">
            <div className="pd-quantity">
              <button onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>−</button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => Math.min(MAX_CART_ITEM_QUANTITY, prev + 1))}
                disabled={quantity >= MAX_CART_ITEM_QUANTITY}
                title={quantity >= MAX_CART_ITEM_QUANTITY ? "Maximum quantity reached" : "Increase quantity"}
              >
                +
              </button>
            </div>

            <button
              className={`pd-primary-btn ${addedFeedback ? "added" : ""}`}
              onClick={handleAddToCart}
            >
              {addedFeedback ? "Added to Cart ✓" : "Add to cart"}
            </button>
          </div>

          <button className="pd-secondary-btn" onClick={handleBuyNow}>
            Buy it now
          </button>

          <div className="pd-service-list">
            <div className="pd-service-item">
              <strong>Offer</strong>
              <span>
                {presentation.offer.code}: {presentation.offer.text}
              </span>
            </div>
            <div className="pd-service-item">
              <strong>Delivery</strong>
              <span>Secure delivery support across India for decor orders.</span>
            </div>
          </div>

          <div className="pd-accordion">
            <div className={`pd-accordion-item ${openSection === "description" ? "open" : ""}`}>
              <button onClick={() => toggle("description")}>
                Description
                <span>{openSection === "description" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <div className="pd-description-copy">
                  {renderInfoBlocks(
                    product?.description && product.description.trim().length > 40
                      ? product.description
                      : `${presentation.description}\n\n${presentation.detailPoints.map((p) => `- ${p}`).join("\n")}`
                  )}
                </div>
              </div>
            </div>

            {(product?.dimensions || product?.material || product?.careInstructions) && (
              <div className={`pd-accordion-item ${openSection === "specs" ? "open" : ""}`}>
                <button onClick={() => toggle("specs")}>
                  Specifications
                  <span>{openSection === "specs" ? "−" : "+"}</span>
                </button>
  
                <div className="pd-accordion-content">
                  <div className="pd-specs-grid">
                    {product?.dimensions && (
                      <div className="pd-spec-row">
                        <span className="pd-spec-label">Dimensions</span>
                        <span className="pd-spec-value">{product.dimensions}</span>
                      </div>
                    )}
                    {product?.material && (
                      <div className="pd-spec-row">
                        <span className="pd-spec-label">Material</span>
                        <span className="pd-spec-value">{product.material}</span>
                      </div>
                    )}
                    {product?.careInstructions && (
                      <div className="pd-spec-row">
                        <span className="pd-spec-label">Care</span>
                        <span className="pd-spec-value">{product.careInstructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={`pd-accordion-item ${openSection === "shipping" ? "open" : ""}`}>
              <button onClick={() => toggle("shipping")}>
                Shipping Information
                <span>{openSection === "shipping" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <div className="pd-description-copy">
                  {renderInfoBlocks(shippingInfo)}
                </div>
              </div>
            </div>

            <div className={`pd-accordion-item ${openSection === "returns" ? "open" : ""}`}>
              <button onClick={() => toggle("returns")}>
                Return Policy
                <span>{openSection === "returns" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <div className="pd-description-copy">
                  {renderInfoBlocks(returnPolicy)}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="pd-full-width-reviews">
        <h3>Customer Reviews</h3>
        <div className="pd-reviews-list">
          {reviews.length === 0 ? (
            <p className="pd-no-reviews">No reviews yet. Be the first to review this piece!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="pd-review-card">
                <div className="pd-rc-head">
                  <strong>{r.user?.name || "Customer"}</strong>
                  <span className="pd-rc-stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
