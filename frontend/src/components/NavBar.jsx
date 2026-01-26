import "./NavBar.css";
function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Logo</div>

      <div className="navbar-links">
        <ul className="nav-links nav-center">
            <li>Home</li>
          <li>3D Files</li>
          <li>Products</li>
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
