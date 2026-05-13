// Site footer with static links and contact info.
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      {/* Main footer content columns */}
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-col footer-brand-col">
            <h4 className="footer-heading">QALARAHI</h4>
            <p className="footer-brand-text">
              Decor chosen for modern spaces that want warmth, presence, and a more
              considered visual rhythm.
            </p>
            <Link className="footer-brand-link" to="/products">
              Explore the collection
            </Link>
          </div>

          {/* Quick navigation links */}
          <div className="footer-col">
            <h4 className="footer-heading">Discover</h4>
            <ul>
              <li>
                <Link className="footer-link" to="/products">All Products</Link>
              </li>
              <li>
                <Link className="footer-link" to="/about">About Us</Link>
              </li>
              <li>
                <Link className="footer-link" to="/contact">Contact</Link>
              </li>
              <li>
                <Link className="footer-link" to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link className="footer-link" to="/track-order">Track Order</Link>
              </li>
            </ul>
          </div>

          {/* Policy/support links */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Care</h4>
            <ul>
              <li>Shipping & Delivery</li>
              <li>Returns</li>
              <li>Terms & Conditions</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="footer-col">
            <h4 className="footer-heading">Concierge</h4>
            <ul>
              <li>+91 9560100560</li>
              <li>hello@qalarahi.com</li>
              <li>Mon–Sat (10AM – 6PM)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright strip */}
      <div className="footer-bottom">
        <p>© 2026 QALARAHI. Curated decor for thoughtful homes.</p>
      </div>
    </footer>
  );
}

export default Footer;
