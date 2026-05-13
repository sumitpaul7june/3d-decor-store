import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import axios from "../api/axios";
import "./Products.css";

const CATEGORIES = ["Living Room", "Bedroom", "Dining", "Office", "Outdoor", "Decor"];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "All";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get("/products", {
          params: { q, category: activeCategory }
        });
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [q, activeCategory]);

  const sortedProducts = useMemo(() => {
    const productList = [...products];
    if (sortBy === "price-low") return productList.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === "price-high") return productList.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "name") return productList.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    if (sortBy === "newest") return productList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return productList;
  }, [products, sortBy]);

  const setCategoryFilter = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  return (
    <section className="shop-page">
      <div className="shop-header">
        <div className="shop-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shop</span>
        </div>
        <h1 className="shop-title">
          {q ? `Search results for "${q}"` : activeCategory !== "All" ? activeCategory : "Shop All"}
        </h1>
        <p className="shop-subtitle">
          {q 
            ? `We found ${products.length} products matching your query.` 
            : "Discover our premium 3D decor pieces crafted for modern living."}
        </p>
      </div>

      <div className="shop-layout">
        {/* SIDEBAR */}
        <aside className="shop-sidebar">
          <div className="filter-group">
            <h3>Categories</h3>
            <ul className="category-list">
              <li>
                <button 
                  className={activeCategory === "All" ? "active" : ""} 
                  onClick={() => setCategoryFilter("All")}
                >
                  All Products
                </button>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    className={activeCategory === cat ? "active" : ""} 
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* MAIN FEED */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <span className="shop-count">{products.length} products</span>
            <div className="shop-sort">
              <label htmlFor="products-sort">Sort by</label>
              <select
                id="products-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="shop-state-msg">Loading catalog...</div>
          ) : error ? (
            <div className="shop-state-msg error">{error}</div>
          ) : sortedProducts.length === 0 ? (
            <div className="shop-state-msg">
              <p>No products found.</p>
              <button className="reset-btn" onClick={() => setSearchParams({})}>Clear all filters</button>
            </div>
          ) : (
            <div className="shop-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} variant="catalog" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Products;
