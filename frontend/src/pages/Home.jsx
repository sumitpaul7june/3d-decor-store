import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import stlProducts from "../data/stlProducts";
import physicalProducts from "../data/physicalProducts";


function Home() {
  const navigate = useNavigate();

  const handleSeeMore = () => {
    navigate("/products");
  };

  return (
    <div>
      <section className="product-section">
        <h2 className="section-title">3D STL Files</h2>

        <div className="product-container stl-products">
          {stlProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>


        <div className="see-more-container">
          <button className="see-more-btn" onClick={handleSeeMore}>
            See more
          </button>
        </div>
      </section>

      <section className="product-section">
        <h2 className="section-title">Physical Products</h2>

        <div className="product-container physical-products">
          {physicalProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>


        <div className="see-more-container">
          <button className="see-more-btn" onClick={handleSeeMore}>
            See more
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
