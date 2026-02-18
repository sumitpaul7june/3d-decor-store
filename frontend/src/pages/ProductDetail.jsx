// Product details page with add-to-cart and accordion sections.
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCartFromServer } from "../store/cartSlice";
import axios from "../api/axios";
import {
  buildCartItemFromProduct,
  normalizeServerCart
} from "../utils/cartHelpers";
import "./ProductDetail.css";

function ProductDetail() {
  // Product id from route /products/:type/:id.
  const { id } = useParams();
  const [openSection, setOpenSection] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const showAddedFeedback = () => {
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 900);
  };

  useEffect(() => {
    // Load selected product details from backend.
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggle = (section) => {
    // Open/close accordion section.
    setOpenSection(openSection === section ? null : section);
  };

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

  const isSTL = product.type === "stl";
  const productImage = product.image || product.images?.[0] || "";

  const handleAddToCart = async () => {
    // Guests use local cart, logged-in users use backend cart.
    if (!isAuthenticated) {
      dispatch(addToCart(buildCartItemFromProduct(product)));
      showAddedFeedback();
      return;
    }

    try {
      await axios.post("/cart/add", {
        productId: product._id,
        quantity: 1
      });

      const { data } = await axios.get("/cart");
      dispatch(setCartFromServer(normalizeServerCart(data)));
      showAddedFeedback();
    } catch (err) {
      console.error("Add to cart failed:", err.response?.data?.message || err.message);
    }
  };

  return (
    <section className="product-detail">
      <div className="pd-grid">
        {/* Left column: product image */}
        <div className="pd-images">
          <img
            src={productImage}
            alt={product.name}
            className="pd-main-image"
          />
        </div>

        {/* Right column: details + CTA + accordion */}
        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price">
            <span className="pd-current">₹{product.price}</span>
            <span className="pd-original">₹{product.originalPrice}</span>
          </div>

          <p className="pd-description">
            {product.description ||
              (isSTL
                ? "High-quality STL file for clean 3D prints and modern interiors."
                : "Premium physical decor product crafted for modern spaces.")}
          </p>

          <button
            className={`pd-primary-btn ${addedFeedback ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {addedFeedback ? "Added to Cart ✓" : "Add to Cart"}
          </button>

          <div className="pd-accordion">
            {/* Description accordion item */}
            <div
              className={`pd-accordion-item ${
                openSection === "description" ? "open" : ""
              }`}
            >
              <button onClick={() => toggle("description")}>
                Description
                <span>{openSection === "description" ? "-" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>{product.description || "No description available."}</p>
              </div>
            </div>

            {/* Shipping accordion item */}
            <div
              className={`pd-accordion-item ${
                openSection === "shipping" ? "open" : ""
              }`}
            >
              <button onClick={() => toggle("shipping")}>
                Shipping
                <span>{openSection === "shipping" ? "-" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>
                  {isSTL
                    ? "No shipping required. Download available immediately."
                    : "Ships within 3-5 business days."}
                </p>
              </div>
            </div>

            {/* Returns accordion item */}
            <div
              className={`pd-accordion-item ${
                openSection === "returns" ? "open" : ""
              }`}
            >
              <button onClick={() => toggle("returns")}>
                Returns
                <span>{openSection === "returns" ? "-" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>
                  {isSTL
                    ? "Digital products are non-refundable."
                    : "7-day return policy on unused items."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
