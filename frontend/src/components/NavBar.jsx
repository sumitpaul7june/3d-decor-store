// Top navigation with cart and profile controls.
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./NavBar.css";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { setCartFromServer, clearCart } from "../store/cartSlice";
import axios from "../api/axios";
import { normalizeServerCart } from "../utils/cartHelpers";

function NavBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = useSelector((state) => state.cart.items);
  const cartCount = items.reduce((total, item) => total + item.qty, 0);

  const auth = useSelector((state) => state.auth);
  const isLoggedIn = auth.isAuthenticated;

  const location = useLocation();
  const isCheckoutRoute = location.pathname.startsWith("/checkout");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileRef = useRef(null);
  const [searchParams] = useSearchParams();

  const handleLogout = () => {
    const performLogout = async () => {
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      try {
        await axios.post("/auth/logout");
      } catch (error) {
        // Continue local logout even if API fails.
      } finally {
        dispatch(logout());
        dispatch(clearCart());
        navigate("/", { replace: true });
      }
    };
    performLogout();
  };

  useEffect(() => {
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
        dispatch(logout());
        dispatch(clearCart());
      }
    };
    validateSessionAndFetchCart();
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCheckoutRoute) setIsCartOpen(false);
  }, [isCheckoutRoute]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/products`);
    }
  };

  return (
    <>
      <nav className={`navbar ${isCheckoutRoute ? "navbar-checkout" : ""}`}>
        <div className="navbar-shell">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">
              <img src="/logo.png" alt="Q" className="navbar-mark-img" />
              <img src="/logo_wide.png" alt="QALARAHI" className="navbar-brand-img" />
            </Link>
          </div>

          <ul className="nav-links nav-center">
            {isCheckoutRoute ? (
              <li className="checkout-pill">Secure Checkout</li>
            ) : (
              <>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Shop</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </>
            )}
          </ul>

          <ul className="nav-links nav-right">
            {!isCheckoutRoute && (
              <li className="nav-search-item">
                <form onSubmit={handleSearchSubmit} className="nav-search-form">
                  <input 
                    type="text" 
                    name="q" 
                    placeholder="Search store..." 
                    defaultValue={searchParams.get("q") || ""}
                  />
                  <button type="submit" aria-label="Search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </form>
              </li>
            )}

            {!isCheckoutRoute && (
              <li
                className="icon-action-btn nav-cart-item"
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l2.1 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.75L20 7H7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="19" r="1.4" fill="currentColor" />
                  <circle cx="17" cy="19" r="1.4" fill="currentColor" />
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </li>
            )}

            {!isLoggedIn ? (
              <li className="nav-auth-item">
                <Link className="icon-link-btn" to="/login" aria-label="Login">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.2 0-7 2.1-7 5v1h14v-1c0-2.9-2.8-5-7-5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ) : (
              <li className="profile-wrapper nav-auth-item" ref={profileRef}>
                <button
                  className="icon-action-btn profile-btn"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.2 0-7 2.1-7 5v1h14v-1c0-2.9-2.8-5-7-5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <ul className="profile-dropdown">
                    <li onClick={() => navigate("/profile")}>My Profile</li>
                    <li onClick={() => navigate("/orders/my")}>My Orders</li>
                    {auth.user?.role === "admin" && (
                        <li onClick={() => navigate("/admin")}>Admin Panel</li>
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
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                  <span /><span /><span />
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className={`navbar-mobile-panel ${isMobileMenuOpen ? "open" : ""}`}>
          <div className="navbar-mobile-links">
            {!isCheckoutRoute && (
              <form onSubmit={handleSearchSubmit} className="nav-search-form" style={{ padding: '0.5rem 0.1rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  name="q" 
                  placeholder="Search store..." 
                  defaultValue={searchParams.get("q") || ""}
                  style={{ width: '100%' }}
                />
                <button type="submit" aria-label="Search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            )}
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            {!isLoggedIn ? (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
            ) : (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                <Link to="/orders/my" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                {auth.user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default NavBar;
