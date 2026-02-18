// About page with brand story and mission blocks.
import "./StoreInfo.css";

function AboutUs() {
  return (
    <section className="store-info-page">
      <article className="store-info-card">
        <p className="store-info-kicker">About</p>
        <h1 className="store-info-title">About Us</h1>
        <p className="store-info-subtitle">
          3D Decor Store is built to offer modern digital and physical decor products
          for creators and homes.
        </p>

        <div className="store-info-grid">
          <div className="store-info-block">
            <h3>Who We Are</h3>
            <p>
              We design and curate clean, minimal decor products that blend technology
              with interior aesthetics.
            </p>
          </div>

          <div className="store-info-block">
            <h3>What We Sell</h3>
            <ul>
              <li>Printable STL files for 3D printing</li>
              <li>Ready-to-use premium physical decor products</li>
              <li>Modern collections for living spaces</li>
            </ul>
          </div>

          <div className="store-info-block">
            <h3>Our Mission</h3>
            <p>
              Make beautiful, practical 3D decor accessible to both makers and
              non-makers through one simple storefront experience.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default AboutUs;
