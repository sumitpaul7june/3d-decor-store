// Site footer with static links and contact info.
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-col">
            <h4 className="footer-heading">3D Decor Store</h4>
            <ul>
              <li>Decor Accents</li>
              <li>Photo Frames</li>
              <li>Vases</li>
              <li>Wall Decor</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul>
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Track Order</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Information</h4>
            <ul>
              <li>Shipping & Delivery</li>
              <li>Returns</li>
              <li>Terms & Conditions</li>
              <li>FAQ</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Need Help?</h4>
            <ul>
              <li>📞 +91 9560100560</li>
              <li>✉ hello@3ddecorstore.in</li>
              <li>Mon–Sat (10AM – 6PM)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 3D Decor Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
