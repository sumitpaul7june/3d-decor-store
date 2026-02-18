// Admin catalog page: list, search, filter, and CRUD actions for products.
import { useEffect, useState } from "react";
import ProductModal from "../../components/admin/ProductModal";
import axios from "../../api/axios";
import { formatCurrencyINR } from "../../utils/formatters";
import "./AdminProducts.css";

function AdminProducts() {
  // Catalog data + modal controls + filter states.
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchProducts = async () => {
    // Fetch full product catalog for admin table.
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/products/admin/all");
      setProducts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    // Open modal in create mode.
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    // Open modal in edit mode with selected product.
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleSave = async (productPayload) => {
    // Create when adding, update when editing.
    try {
      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, productPayload);
      } else {
        await axios.post("/products", productPayload);
      }
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const filteredProducts = products.filter((product) => {
    // Match selected type + text query.
    const matchesType = typeFilter === "all" || product.type === typeFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  return (
    <section className="admin-products">
      {/* Header + primary action */}
      <div className="admin-page-head">
        <div>
          <p className="admin-page-kicker">Catalog</p>
          <h1 className="admin-products-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage product details, pricing, and type from one place.
          </p>
        </div>
        <button onClick={handleAdd} className="add-product-btn">
          Add Product
        </button>
      </div>
      {error && <p className="admin-products-error">{error}</p>}

      {/* Search + type filter toolbar */}
      <div className="admin-products-toolbar">
        <p className="admin-toolbar-meta">
          Showing {filteredProducts.length} of {products.length}
        </p>
        <input
          className="products-search-input"
          type="text"
          placeholder="Search by name or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="products-type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          <option value="stl">STL</option>
          <option value="physical">Physical</option>
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
      // Products table/grid.
      <div className="products-table">
        <div className="products-table-head">
          <span>Product</span>
          <span>Category</span>
          <span>Type</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        {filteredProducts.map((product) => (
          // One product row.
          <div key={product._id} className="products-table-row">
            <span className="product-cell">
              <img
                className="product-thumb"
                src={product.images?.[0] || "https://via.placeholder.com/64?text=No+Img"}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/64?text=No+Img";
                }}
              />
              <span>{product.name}</span>
            </span>
            <span>{product.category || "-"}</span>
            <span>
              <span className={`type-chip type-${product.type}`}>
                {product.type}
              </span>
            </span>
            <span>{formatCurrencyINR(product.price)}</span>
            <span className="actions">
              <button
                className="edit-btn"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </span>
          </div>
        ))}

        {!filteredProducts.length && (
          <p className="admin-table-empty">
            No products matched your search/filter.
          </p>
        )}
      </div>
      )}

      {/* Shared add/edit product modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
      />
    </section>
  );
}

export default AdminProducts;
