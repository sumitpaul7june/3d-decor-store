// Admin top bar with quick navigation and logout.
import "./AdminHeader.css";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";

function AdminHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth state and return to public home.
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <header className="admin-header">
      {/* Left */}
      <div className="admin-header-left">
        <h1 className="admin-header-title"><Link to="/">
          Home
        </Link></h1>
        
      </div>

      {/* Right */}
      <div className="admin-header-right">
        <span className="admin-header-user">Admin</span>
        <button
          className="admin-header-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
