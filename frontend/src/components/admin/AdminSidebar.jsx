// Admin sidebar navigation with active states and logout.
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { clearCart } from "../../store/cartSlice";
import axios from "../../api/axios";

function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        // Clear auth cookie on backend.
        await axios.post("/auth/logout");
      } catch (error) {
        // Continue local logout even if API fails.
      } finally {
        // Always clear local state.
        dispatch(logout());
        dispatch(clearCart());
        navigate("/", { replace: true });
      }
    };

    performLogout();
  };

  return (
    <aside className="sidebar">
      {/* Brand block */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">Q</span>
        <div>
          <p className="sidebar-logo-title">QALARAHI</p>
          <p className="sidebar-logo-subtitle">Admin Panel</p>
        </div>
      </div>

      {/* Main admin navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-group-title">Operations</p>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Orders
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className="sidebar-item disabled"
          onClick={(e) => e.preventDefault()}
        >
          Inventory (Coming Soon)
        </NavLink>

        <p className="sidebar-group-title">Storefront</p>

        <NavLink
          to="/admin/home-content"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Home Content
        </NavLink>

        <NavLink
          to="/admin/store-policies"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          Store Policies
        </NavLink>
      </nav>

      {/* Footer links/actions */}
      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-item">
          ← Home
        </NavLink>

        <button className="sidebar-item logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
