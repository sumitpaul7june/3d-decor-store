// Reusable product card used on home and product listing pages.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./ProductCard.css";
import { getProductPresentation } from "../utils/productPresentation";
import { buildProductPath } from "../utils/productRoutes";
import axios from "../api/axios";
import { addToCart, setCartFromServer } from "../store/cartSlice";
import { setWishlist } from "../store/authSlice";
import { buildCartItemFromProduct, normalizeServerCart } from "../utils/cartHelpers";
import { formatCurrencyINR } from "../utils/formatters";


function ProductCard({ product, variant = "default" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const wishlist = user?.wishlist || [];
  const inWishlist = wishlist.some(item => (item._id || item) === product._id);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const presentation = getProductPresentation(product);
  const originalPrice = product.originalPrice || product.price;
  const savings = Math.max(originalPrice - product.price, 0);
  const discountPercent =
    originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;
  const isCatalogCard = variant === "catalog";
  const isHomeCard = variant === "home";

  const hoverImage = presentation.gallery?.length > 1 ? presentation.gallery[1] : null;

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

  const handleWishlist = async (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    try {
      setWishlistLoading(true);
      const { data } = await axios.post("/users/wishlist", { productId: product._id });
      dispatch(setWishlist(data));
    } catch (error) {
      console.error("Wishlist toggle failed", error);
    } finally {
      setWishlistLoading(false);
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
        <button 
          className={`product-wishlist-btn ${inWishlist ? "active" : ""}`}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label="Toggle wishlist"
        >
          {inWishlist ? "♥" : "♡"}
        </button>
        <img
          src={presentation.coverImage}
          alt={product.name}
          className={`product-img-main ${hoverImage ? "has-hover" : ""}`}
          onError={(e) => {
            e.currentTarget.src =
              presentation.gallery[0] ||
              "https://via.placeholder.com/600x760?text=Image+Unavailable";
          }}
        />
        {hoverImage && (
          <img 
            src={hoverImage} 
            alt={`${product.name} alternate view`} 
            className="product-img-hover"
          />
        )}
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


      </div>
    </article>
  );
}

export default ProductCard;
