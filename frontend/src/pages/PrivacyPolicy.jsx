// Privacy policy mock page for store-level policies.
import "./StoreInfo.css";

function PrivacyPolicy() {
  return (
    <section className="store-info-page">
      <article className="store-info-card">
        <p className="store-info-kicker">Policy</p>
        <h1 className="store-info-title">Privacy Policy</h1>
        <p className="store-info-subtitle">
          This is a mock policy page for development/demo use.
        </p>

        <div className="store-info-grid">
          <div className="store-info-block">
            <h3>Data We Collect</h3>
            <p>
              We collect basic account details, delivery address, and order information
              to process purchases and support customer service.
            </p>
          </div>

          <div className="store-info-block">
            <h3>How We Use Data</h3>
            <p>
              We use customer data only for authentication, order fulfillment, updates,
              and support. We do not sell your personal data.
            </p>
          </div>

          <div className="store-info-block">
            <h3>Storage and Security</h3>
            <p>
              Your data is stored securely in our database and access is restricted to
              authorized systems and admins only.
            </p>
          </div>

          <div className="store-info-block">
            <h3>Support</h3>
            <p>
              For privacy-related questions, contact us at hello@3ddecorstore.in.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default PrivacyPolicy;
