// Top navigation with cart and profile controls.
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { setCartFromServer, clearCart } from "../store/cartSlice";
import axios from "../api/axios";
import { normalizeServerCart } from "../utils/cartHelpers";

function NavBar() {
  // UI state for cart drawer and profile dropdown.
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Cart
  const items = useSelector((state) => state.cart.items);
  const cartCount = items.reduce((total, item) => total + item.qty, 0);

  // Auth
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = auth.isAuthenticated;

  const location = useLocation();
  const isCheckoutRoute = location.pathname.startsWith("/checkout");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const handleLogout = () => {
    const performLogout = async () => {
      // Close dropdown immediately for responsive UI.
      setIsProfileOpen(false);

      try {
        // Clear auth cookie on backend.
        await axios.post("/auth/logout");
      } catch (error) {
        // Continue local logout even if API fails.
      } finally {
        // Always clear local auth/cart state and redirect.
        dispatch(logout());
        dispatch(clearCart());
        navigate("/", { replace: true });
      }
    };

    performLogout();
  };

  useEffect(() => {
    // On login, validate session and load server cart into Redux.
    const validateSessionAndFetchCart = async () => {
      if (!isLoggedIn) {
        dispatch(clearCart());
        return;
      }

      try {
        await axios.get("/users/profile");

        const { data } = await axios.get("/cart");
        dispatch(setCartFromServer(normalizeServerCart(data)));
      } catch (error) {
        console.error("Session/cart sync failed:", error.response?.data?.message || error.message);
        dispatch(logout());
        dispatch(clearCart());
      }
    };

    validateSessionAndFetchCart();
  }, [isLoggedIn, dispatch]);

  // Close profile dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Keep checkout focused: close cart drawer if user reaches checkout.
    if (isCheckoutRoute) {
      setIsCartOpen(false);
    }
  }, [isCheckoutRoute]);

  return (
    <>
      {/* Main top nav */}
      <nav className={`navbar ${isCheckoutRoute ? "navbar-checkout" : ""}`}>
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">Logo</Link>
        </div>

        {/* Center links */}
        <ul className="nav-links nav-center">
          {isCheckoutRoute ? (
            <li className="checkout-pill">Secure Checkout</li>
          ) : (
            <>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
            </>
          )}
        </ul>

        {/* Right side */}
        <ul className="nav-links nav-right">
          {/* Cart */}
          {!isCheckoutRoute && (
            <li
              className="cart-btn"
              onClick={() => setIsCartOpen(true)}
            >
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </li>
          )}

          {/* Auth */}
          {!isLoggedIn ? (
            <li>
              <Link to="/login">Login</Link>
            </li>
          ) : (
            <li className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-btn"
                onClick={() =>
                  setIsProfileOpen((prev) => !prev)
                }
              >
                Profile ▾
              </button>

              {isProfileOpen && (
                // Dropdown menu for authenticated users.
                <ul className="profile-dropdown">
                  <li onClick={() => navigate("/profile")}>
                    My Profile
                  </li>
                  <li onClick={() => navigate("/orders/my")}>
                    My Orders
                  </li>

                  {/* ADMIN LINK (explicit checks) */}
                  {auth.user !== null &&
                    auth.user.role === "admin" && (
                      <li onClick={() => navigate("/admin")}>
                        Admin Panel
                      </li>
                    )}

                  <li onClick={handleLogout}>Logout</li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}

export default NavBar;
