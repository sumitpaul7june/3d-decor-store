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
  const activeMaterial = searchParams.get("material") || "All";
  const inStockOnly = searchParams.get("inStock") === "true";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const MATERIALS = useMemo(() => {
    // Unique materials from loaded products if any, or static list
    const materials = new Set(["Wood", "Metal", "Ceramic", "Glass", "Fabric", "Plastic", "Concrete"]);
    products.forEach(p => p.material && materials.add(p.material));
    return Array.from(materials).sort();
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = { q };
        if (activeCategory !== "All") params.category = activeCategory;
        if (activeMaterial !== "All") params.material = activeMaterial;
        if (inStockOnly) params.inStock = "true";
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await axios.get("/products", { params });
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [q, activeCategory, activeMaterial, inStockOnly, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    const productList = [...products];
    if (sortBy === "price-low") return productList.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === "price-high") return productList.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "name") return productList.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    if (sortBy === "newest") return productList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return productList;
  }, [products, sortBy]);

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "All" || value === "" || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
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
                  onClick={() => setFilter("category", "All")}
                >
                  All Products
                </button>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    className={activeCategory === cat ? "active" : ""} 
                    onClick={() => setFilter("category", cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group mt-6">
            <h3>Material</h3>
            <ul className="category-list">
              <li>
                <button 
                  className={activeMaterial === "All" ? "active" : ""} 
                  onClick={() => setFilter("material", "All")}
                >
                  Any Material
                </button>
              </li>
              {MATERIALS.map(mat => (
                <li key={mat}>
                  <button 
                    className={activeMaterial === mat ? "active" : ""} 
                    onClick={() => setFilter("material", mat)}
                  >
                    {mat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group mt-6">
            <h3>Availability</h3>
            <label className="checkbox-filter">
              <input 
                type="checkbox" 
                checked={inStockOnly} 
                onChange={(e) => setFilter("inStock", e.target.checked)} 
              />
              <span>In Stock Only</span>
            </label>
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
            <div className="shop-state-msg">
              <div className="shop-loading-spinner"></div>
              <p>Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="shop-state-msg error">{error}</div>
          ) : sortedProducts.length === 0 ? (
            <div className="shop-empty-state">
              <div className="shop-empty-icon">🔍</div>
              <h2>No products found</h2>
              <p>We couldn't find any products matching your current filters.</p>
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
