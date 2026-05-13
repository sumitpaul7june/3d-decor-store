// Contact page with mock support details and business hours.
import "./StoreInfo.css";

function Contact() {
  return (
    <section className="store-info-page">
      <article className="store-info-card">
        <p className="store-info-kicker">Support</p>
        <h1 className="store-info-title">Contact</h1>
        <p className="store-info-subtitle">
          Reach out to us for order help, product questions, and business inquiries.
        </p>

        <div className="store-info-grid">
          <div className="store-info-block">
            <h3>Email</h3>
            <p>hello@3ddecorstore.in</p>
          </div>

          <div className="store-info-block">
            <h3>Phone</h3>
            <p>+91 9560100560</p>
          </div>

          <div className="store-info-block">
            <h3>Working Hours</h3>
            <p>Monday to Saturday, 10:00 AM to 6:00 PM (IST)</p>
          </div>

          <div className="store-info-block">
            <h3>Address</h3>
            <p>Mumbai, India (Demo Store Location)</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default Contact;
