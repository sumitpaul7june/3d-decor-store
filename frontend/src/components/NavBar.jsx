import "./NavBar.css";
import {Link } from "react-router-dom";
function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Logo</Link>
      </div>

      <div className="navbar-links">
        <ul className="nav-links nav-center">
            <li>
            <Link to="/">Home</Link>
            </li>
          <li>
          <Link to="/stl-products">3D Files</Link>
          </li>
          <li>
          <Link to="/products">Products</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-links">
        <ul className="nav-links nav-right">
          <li>Cart</li>
          <li>Login</li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
