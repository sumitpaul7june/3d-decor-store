// Reusable product card used on home and product listing pages.
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ProductCard.css";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { addToCart, setCartFromServer } from "../store/cartSlice";
import {
  buildCartItemFromProduct,
  normalizeServerCart
} from "../utils/cartHelpers";

function ProductCard({ product }) {
  // Navigation + Redux helpers.
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // Short UI feedback state for "Add to Cart" animation/text.
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Support both Mongo `_id` and legacy `id` shapes.
  const productId = product._id || product.id;
  // Prefer backend image fields, fallback to empty string.
  const productImage = product.image || product.images?.[0] || "";

  const showAddedFeedback = () => {
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 900);
  };

  const handleCardClick = () => {
    // Open product details page.
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e) => {
    // Stop parent click so Add to Cart doesn't open details page.
    e.stopPropagation();

    // Guest users use local Redux cart.
    if (!isAuthenticated) {
      dispatch(addToCart(buildCartItemFromProduct(product)));
      showAddedFeedback();
      return;
    }

    // Logged-in users sync cart with backend.
    try {
      await axios.post("/cart/add", {
        productId,
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
    // Entire card is clickable to open product details.
    <div className="product" onClick={handleCardClick}>
      <div className="product-image">
        <img
          src={productImage || "https://via.placeholder.com/600x600?text=No+Image"}
          alt={product.name}
          onError={(e) => {
            // If image URL fails, swap to fallback placeholder.
            e.currentTarget.src =
              "https://via.placeholder.com/600x600?text=Image+Unavailable";
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>

        <div className="price">
          <span className="current-price">₹{product.price}</span>
          <span className="original-price">₹{product.originalPrice}</span>
        </div>

        <button
          className={`btn-primary ${addedFeedback ? "added" : ""}`}
          onClick={handleAddToCart}
        >
          {addedFeedback ? "Added to Cart ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
