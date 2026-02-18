// Admin top bar with quick navigation and logout.
import "./AdminHeader.css";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { clearCart } from "../../store/cartSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";

function AdminHeader() {
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
    <header className="admin-header">
      {/* Left: admin brand/title */}
      <div className="admin-header-left">
        <p className="admin-header-kicker">Store Admin</p>
        <h1 className="admin-header-title">
          <Link to="/admin">3D Decor Control</Link>
        </h1>
      </div>

      {/* Right: quick actions */}
      <div className="admin-header-right">
        <Link className="admin-header-home" to="/">
          View Store
        </Link>
        <span className="admin-header-user">Admin</span>
        <button className="admin-header-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
