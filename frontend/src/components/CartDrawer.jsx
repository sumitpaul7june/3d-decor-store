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

function CartDrawer({ isOpen, onClose }) {
  // Cart and auth data from Redux.
  const items = useSelector((state) => state.cart.items);
  const isLoggedIn = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <span className="cart-subtext">{items.length} items</span>
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
                Looks like you haven’t added anything yet
              </p>
              <button className="browse-btn" onClick={onClose}>
                Continue shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              // One cart line item
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <p className="name">{item.name}</p>
                  <p className="price">₹{item.price}</p>
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
                  <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer footer with subtotal + checkout CTA */}
        <div className="cart-footer">
          <div className="subtotal">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
