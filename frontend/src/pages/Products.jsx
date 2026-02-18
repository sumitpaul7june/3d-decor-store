// Product listing page filtered by route type (stl or physical).
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import "./Products.css";

function Products() {
  // Read product type from route, e.g. /products/stl.
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch products whenever the type route param changes.
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`/products?type=${type}`);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  const title = type === "stl" ? "STL Files" : "Physical Products";

  return (
    <section className="products-page">
      {/* Dynamic heading based on route category */}
      <h2 className="section-title">{title}</h2>

      {loading && <p>Loading products...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        // Product grid for selected category.
        <div className="product-container">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} type={type} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
