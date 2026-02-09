// Top navigation with cart and profile controls.
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

function NavBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Cart
  const items = useSelector((state) => state.cart.items);
  const cartCount = items.reduce((total, item) => total + item.qty, 0);

  // Auth
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = auth.isAuthenticated;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logout());
    navigate("/");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    // Close profile dropdown when clicking outside.
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

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">Logo</Link>
        </div>

        {/* Center links */}
        <ul className="nav-links nav-center">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/products/stl">STL Files</Link>
          </li>
          <li>
            <Link to="/products/physical">Products</Link>
          </li>
        </ul>

        {/* Right side */}
        <ul className="nav-links nav-right">
          {/* Cart */}
          <li
            className="cart-btn"
            onClick={() => setIsCartOpen(true)}
          >
            Cart
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </li>

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
                <ul className="profile-dropdown">
                  <li onClick={() => navigate("/profile")}>
                    My Profile
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
