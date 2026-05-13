// Slide-out cart panel for viewing and updating cart items.
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./CartDrawer.css";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  setCartFromServer,
  increaseQty,
  decreaseQty,
  removeCart
} from "../store/cartSlice";
import { normalizeServerCart } from "../utils/cartHelpers";
import { formatCurrencyINR } from "../utils/formatters";

function CartDrawer({ isOpen, onClose }) {
  const MAX_CART_ITEM_QUANTITY = 10;
  // Cart and auth data from Redux.
  const items = useSelector((state) => state.cart.items);
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  const fetchCart = async () => {
    // Fetch server cart when drawer opens for logged-in users.
    if (!isLoggedIn) return;
    try {
      const { data } = await axios.get("/cart");
      dispatch(setCartFromServer(normalizeServerCart(data)));
    } catch (err) {
      console.error("Fetch cart failed:", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    // Whenever drawer opens, refresh cart from backend for logged-in users.
    if (isOpen && isLoggedIn) {
      fetchCart();
    }
  }, [isOpen, isLoggedIn]);

  const updateQty = async (productId, quantity) => {
    // Guests update local Redux cart only.
    if (!isLoggedIn) {
      const currentItem = items.find((item) => item.id === productId);
      if (!currentItem) return;

      if (quantity > currentItem.qty) {
        dispatch(increaseQty(productId));
      } else if (quantity < currentItem.qty) {
        dispatch(decreaseQty(productId));
      }
      return;
    }

    // Logged-in flow: update server cart quantity.
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }

    try {
      await axios.put("/cart/update", { productId, quantity });
      await fetchCart();
    } catch (err) {
      console.error("Update cart failed:", err.response?.data?.message || err.message);
    }
  };

  const removeItem = async (productId) => {
    // Guests remove item locally.
    if (!isLoggedIn) {
      dispatch(removeCart(productId));
      return;
    }

    // Logged-in users remove from server cart.
    try {
      await axios.delete(`/cart/remove/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error("Remove cart item failed:", err.response?.data?.message || err.message);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    // Guests are redirected to login before checkout.
    if (items.length === 0) return;

    if (isLoggedIn) {
      navigate("/checkout/address");
    } else {
      navigate("/login", { state: { from: "/checkout/address" } });
    }
  };

  return (
    // Overlay closes drawer on outside click.
    <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="cart-header">
          <div>
            <h3>My Cart</h3>
            <span className="cart-subtext">{totalItems} pieces selected</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Cart content */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p className="empty-title">Your cart is empty</p>
              <p className="empty-subtext">
                Start with a few pieces and we will hold them here while you edit your space.
              </p>
              <button
                className="browse-btn"
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              // One cart line item
              <div key={item.id} className="cart-item">
                <div className="cart-item-media">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 300'><rect width='240' height='300' fill='%23f7f5f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777777' font-family='Arial' font-size='28'>Q</text></svg>";
                      }}
                    />
                  ) : (
                    <span className="cart-item-fallback">
                      {(item.name || "Q").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="cart-item-info">
                  <p className="name">{item.name}</p>
                  <p className="cart-item-meta">Selected for your QALARAHI home edit</p>
                  <p className="price">{formatCurrencyINR(item.price * item.qty)}</p>
                  <p className="cart-item-unit-price">
                    {formatCurrencyINR(item.price)} each
                  </p>
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-qty">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    disabled={item.qty >= MAX_CART_ITEM_QUANTITY}
                    title={item.qty >= MAX_CART_ITEM_QUANTITY ? "Maximum quantity reached" : "Increase quantity"}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer footer with subtotal + checkout CTA */}
        <div className="cart-footer">
          <div className="subtotal">
            <span>Subtotal</span>
            <strong>{formatCurrencyINR(subtotal)}</strong>
          </div>
          <p className="cart-footer-note">
            Shipping, delivery windows, and payment review appear in the next step.
          </p>
          <button className="checkout-btn" onClick={handleCheckout} disabled={!items.length}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
