import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Admin</div>

      <nav className="sidebar-nav">
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
          to="/admin/customers"
          className="sidebar-item disabled"
          onClick={(e) => e.preventDefault()}
        >
          Customers (Coming Soon)
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className="sidebar-item disabled"
          onClick={(e) => e.preventDefault()}
        >
          Inventory (Coming Soon)
        </NavLink>
      </nav>

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
