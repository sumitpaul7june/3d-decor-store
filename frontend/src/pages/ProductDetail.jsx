import { useParams } from "react-router-dom";
import { useState } from "react";
import physicalProducts from "../data/physicalProducts";
import stlProducts from "../data/stlProducts";
import "./ProductDetail.css";

function ProductDetail() {
  const { type, id } = useParams();
  const [openSection, setOpenSection] = useState(null);

  const products =
    type === "stl"
      ? stlProducts
      : type === "physical"
      ? physicalProducts
      : [];

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <section className="product-not-found">
        Product not found
      </section>
    );
  }

  const isSTL = type === "stl";

  const toggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <section className="product-detail">
      <div className="pd-grid">

        {/* IMAGE */}
        <div className="pd-images">
          <img
            src={product.image}
            alt={product.name}
            className="pd-main-image"
          />
        </div>

        {/* INFO */}
        <div className="pd-info">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price">
            <span className="pd-current">₹{product.price}</span>
            <span className="pd-original">₹{product.originalPrice}</span>
          </div>

          <p className="pd-description">
            {isSTL
              ? "High‑quality STL file for clean 3D prints and modern interiors."
              : "Premium physical decor product crafted for modern spaces."}
          </p>

          <button className="pd-primary-btn">
            {isSTL ? "Download STL" : "Add to Cart"}
          </button>

          {/* ACCORDION */}
          <div className="pd-accordion">

            {/* DESCRIPTION */}
            <div className={`pd-accordion-item ${openSection === "description" ? "open" : ""}`}>
              <button onClick={() => toggle("description")}>
                Description
                <span>{openSection === "description" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>
                  This product is designed with a minimal aesthetic and premium
                  attention to detail.
                </p>
              </div>
            </div>

            {/* SHIPPING */}
            <div className={`pd-accordion-item ${openSection === "shipping" ? "open" : ""}`}>
              <button onClick={() => toggle("shipping")}>
                Shipping
                <span>{openSection === "shipping" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>
                  {isSTL
                    ? "No shipping required. Download available immediately."
                    : "Ships within 3–5 business days."}
                </p>
              </div>
            </div>

            {/* RETURNS */}
            <div className={`pd-accordion-item ${openSection === "returns" ? "open" : ""}`}>
              <button onClick={() => toggle("returns")}>
                Returns
                <span>{openSection === "returns" ? "−" : "+"}</span>
              </button>

              <div className="pd-accordion-content">
                <p>
                  {isSTL
                    ? "Digital products are non‑refundable."
                    : "7‑day return policy on unused items."}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default ProductDetail;
