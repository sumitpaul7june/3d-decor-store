// Product listing page for the physical product catalog.
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch physical products when page loads.
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="products-page">
      {/* Catalog heading */}
      <h2 className="section-title">Physical Products</h2>

      {loading && <p>Loading products...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        // Product grid for the catalog.
        <div className="product-container">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
