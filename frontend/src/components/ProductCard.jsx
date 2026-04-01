// Reusable product card used on home and product listing pages.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./ProductCard.css";
import { getProductPresentation } from "../utils/productPresentation";
import { buildProductPath } from "../utils/productRoutes";
import axios from "../api/axios";
import { addToCart, setCartFromServer } from "../store/cartSlice";
import { buildCartItemFromProduct, normalizeServerCart } from "../utils/cartHelpers";
import { formatCurrencyINR } from "../utils/formatters";

const toFinishClass = (finishName = "") =>
  `swatch-${finishName.toLowerCase().replace(/\s+/g, "-")}`;

function ProductCard({ product, variant = "default" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const presentation = getProductPresentation(product);
  const originalPrice = product.originalPrice || product.price;
  const savings = Math.max(originalPrice - product.price, 0);
  const discountPercent =
    originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;
  const isCatalogCard = variant === "catalog";
  const isHomeCard = variant === "home";

  const handleCardClick = () => {
    navigate(buildProductPath(product));
  };

  const syncCart = async () => {
    if (!isAuthenticated) {
      dispatch(addToCart(buildCartItemFromProduct(product, 1)));
      return;
    }

    await axios.post("/cart/add", {
      productId: product._id,
      quantity: 1
    });

    const { data } = await axios.get("/cart");
    dispatch(setCartFromServer(normalizeServerCart(data)));
  };

  const handleAddToCart = async (event) => {
    event.stopPropagation();

    try {
      setIsAdding(true);
      await syncCart();
    } catch (error) {
      console.error("Add to cart failed:", error.response?.data?.message || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async (event) => {
    event.stopPropagation();

    try {
      setIsBuying(true);
      await syncCart();
      navigate("/checkout/address");
    } catch (error) {
      console.error("Buy now failed:", error.response?.data?.message || error.message);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <article
      className={`product ${isCatalogCard ? "product--catalog" : ""} ${isHomeCard ? "product--home" : ""}`}
      onClick={handleCardClick}
    >
      <div className="product-image">
        {savings > 0 && (
          <span className={`product-sale-pill ${isCatalogCard ? "product-sale-pill--catalog" : ""}`}>
            {isCatalogCard && discountPercent > 0 ? `Save ${discountPercent}%` : "Sale"}
          </span>
        )}
        <img
          src={presentation.coverImage}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src =
              presentation.gallery[0] ||
              "https://via.placeholder.com/600x760?text=Image+Unavailable";
          }}
        />
      </div>

      <div className="product-info">
        {isCatalogCard && (
          <p className="product-category-label">{presentation.categoryLabel}</p>
        )}

        <h3 className="product-title">{product.name}</h3>

        <div className="price">
          {originalPrice > product.price && (
            <span className="original-price">{formatCurrencyINR(originalPrice)}</span>
          )}
          <span className="current-price">{formatCurrencyINR(product.price)}</span>
        </div>

        {savings > 0 && !isCatalogCard && (
          <p className="product-savings">SAVE ₹{savings.toLocaleString("en-IN")}</p>
        )}

        {isHomeCard && (
          <div className="product-card-actions">
            <button
              type="button"
              className="product-card-btn product-card-btn--ghost"
              onClick={handleAddToCart}
              disabled={isAdding || isBuying}
            >
              {isAdding ? "Adding..." : "Add to cart"}
            </button>
            <button
              type="button"
              className="product-card-btn product-card-btn--primary"
              onClick={handleBuyNow}
              disabled={isAdding || isBuying}
            >
              {isBuying ? "Processing..." : "Buy now"}
            </button>
          </div>
        )}

        {!isCatalogCard && (
          <div className="product-footer">
            <div className="product-swatches" aria-label="Available finishes">
              {presentation.finishes.map((finish) => (
                <span
                  key={finish.name}
                  className={`product-swatch ${toFinishClass(finish.name)}`}
                  title={finish.name}
                />
              ))}
            </div>

            <span className="product-arrow" aria-hidden="true">→</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
