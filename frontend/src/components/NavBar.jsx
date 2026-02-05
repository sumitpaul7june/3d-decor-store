import { Link } from "react-router-dom";
import "./NavBar.css";
import { useState } from "react";
import CartDrawer from "./CartDrawer";
import { useSelector } from "react-redux";


function NavBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const items = useSelector((state) => state.cart.items);

  const cardCount = items.reduce((total, item) => total + item.qty, 0);

  return (
    <>
   
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
        <li className="cart-btn" onClick={() => setIsCartOpen(true)}>
          Cart
          {
            cardCount > 0 && (<span className="card-badge">{cardCount}</span>)
          }
          
          </li>
        <li> <Link to="/login">Login</Link></li>
      </ul>
    </nav>


    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>

    </>
    
  );
}

export default NavBar;
