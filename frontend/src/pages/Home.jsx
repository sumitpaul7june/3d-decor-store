import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import stlProducts from "../data/stlProducts";
import physicalProducts from "../data/physicalProducts";

function Home() {
  const navigate = useNavigate();

  const handleSeeMore = (type) => {
    navigate(`/products/${type}`);
  };

  return (
    <div>
      <section className="product-section">
        <h2 className="section-title">STL Files</h2>

        <div className="product-container stl-products">
          {stlProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} type="stl" />
          ))}
        </div>

        <div className="see-more-container">
          <button className="see-more-btn" onClick={() => handleSeeMore("stl")}>
            See more
          </button>
        </div>
      </section>

      <section className="product-section">
        <h2 className="section-title">Physical Products</h2>

        <div className="product-container physical-products">
          {physicalProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} type="physical" />
          ))}
        </div>

        <div className="see-more-container">
          <button
            className="see-more-btn"
            onClick={() => handleSeeMore("physical")}
          >
            See more
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
