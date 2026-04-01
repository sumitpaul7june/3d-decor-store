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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      setIsMobileMenuOpen(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className={`navbar ${isCheckoutRoute ? "navbar-checkout" : ""}`}>
        <div className="navbar-shell">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">
              <span className="navbar-mark">Q</span>
              <span className="navbar-brand-name">QALARAHI</span>
            </Link>
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
                  <Link to="/products">Shop All</Link>
                </li>
                <li>
                  <Link to="/products">Bestsellers</Link>
                </li>
                <li>
                  <Link to="/products">New Arrivals</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </>
            )}
          </ul>

          {/* Right side */}
          <ul className="nav-links nav-right">
            {!isCheckoutRoute && (
              <li className="nav-utility-link">
                <Link to="/track-order">Track Order</Link>
              </li>
            )}

            {/* Cart */}
            {!isCheckoutRoute && (
              <li
                className="icon-action-btn nav-cart-item"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                title="Cart"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 4h2l2.1 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.75L20 7H7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </li>
            )}

            {/* Auth */}
            {!isLoggedIn ? (
              <li className="nav-auth-item">
                <Link className="icon-link-btn" to="/login" aria-label="Login or profile" title="Login">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.2 0-7 2.1-7 5v1h14v-1c0-2.9-2.8-5-7-5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ) : (
              <li className="profile-wrapper nav-auth-item" ref={profileRef}>
                <button
                  className="icon-action-btn profile-btn"
                  onClick={() =>
                    setIsProfileOpen((prev) => !prev)
                  }
                  aria-label="Open profile menu"
                  title="Profile"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.2 0-7 2.1-7 5v1h14v-1c0-2.9-2.8-5-7-5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

            {!isCheckoutRoute && (
              <li className="nav-mobile-toggle-item">
                <button
                  type="button"
                  className={`navbar-mobile-toggle ${isMobileMenuOpen ? "active" : ""}`}
                  aria-label="Toggle navigation menu"
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                  <span />
                  <span />
                  <span />
                </button>
              </li>
            )}
          </ul>
        </div>

        {!isCheckoutRoute && (
          <div className={`navbar-mobile-panel ${isMobileMenuOpen ? "open" : ""}`}>
            <div className="navbar-mobile-links">
              <Link to="/">Home</Link>
              <Link to="/products">Shop All</Link>
              <Link to="/products">Bestsellers</Link>
              <Link to="/products">New Arrivals</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/track-order">Track Order</Link>
              {!isLoggedIn ? (
                <Link to="/login">Login</Link>
              ) : (
                <>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/orders/my">My Orders</Link>
                  {auth.user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
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
