import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import { useEffect, useState, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";



function NavBar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const items = useSelector((state) => state.cart.items);
  const cardCount = items.reduce((total, item) => total + item.qty, 0);

  const isLoggedIn = useSelector(
    (state) => state.auth.isAuthenticated
  );
  
    // const isLoggedIn = true;
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const profileRef = useRef(null);

  const handleLogout = () => {
    setIsProfileOpen(false);
    dispatch(logout());
    navigate('/');
  }


  useEffect(() => {
    const handleClickOutside = (e) => {
      if(profileRef.current && !profileRef.current.contains(e.target))
      {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [])
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

        {/* Auth */}
       {
          !isLoggedIn ? (
            <li> <Link to="/login">Login</Link></li>
          ) : 
          (

            <li className="profile-wrapper" ref={profileRef}>
                <button className="profile-btn" onClick={() => setIsProfileOpen(prev => !prev)}
                >
                  Profile ▾
                </button>

                {
                  isProfileOpen && 
                  (
                      <ul className="profile-dropdown">
                        <li onClick={() => navigate("/profile")}>My Profile</li>
                        <li onClick={handleLogout}>Logout</li>
                      </ul>
                  )
                }
            </li>

          )
       }
       
      </ul>
    </nav>


    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>

    </>
    
  );
}

export default NavBar;
