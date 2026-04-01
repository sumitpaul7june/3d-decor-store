// Product listing page for the physical product catalog.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("featured");

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

  const sortedProducts = useMemo(() => {
    const productList = [...products];

    if (sortBy === "price-low") {
      return productList.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price-high") {
      return productList.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "name") {
      return productList.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    }

    if (sortBy === "newest") {
      return productList.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    return productList;
  }, [products, sortBy]);

  return (
    <section className="products-page">
      <div className="products-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>All Products</span>
      </div>

      <div className="products-header">
        <p className="products-overline">All Products</p>
        <h1 className="products-page-title">Physical Products</h1>
      </div>

      <div className="products-toolbar">
        <div className="products-toolbar-left">
          <span className="products-toolbar-count">{products.length} products</span>
        </div>
        <div className="products-toolbar-right">
          <label className="products-sort-label" htmlFor="products-sort">
            Sort by
          </label>
          <select
            id="products-sort"
            className="products-sort-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {loading && <p className="products-state">Loading products...</p>}
      {error && <p className="products-state">{error}</p>}

      {!loading && !error && (
        // Product grid for the catalog.
        <div className="products-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} variant="catalog" />
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
