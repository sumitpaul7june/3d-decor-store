import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Logo</Link>
      </div>

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

      <ul className="nav-links nav-right">
        <li>Cart</li>
        <li> <Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;
