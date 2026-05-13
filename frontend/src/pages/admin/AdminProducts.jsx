// Admin catalog page: list, search, and CRUD actions for physical products.
import { useState } from "react";
import axios from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrencyINR } from "../../utils/formatters";
import ProductModal from "../../components/admin/ProductModal";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import "./AdminProducts.css";

function AdminProducts() {
  // Modal controls + search state.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [query, setQuery] = useState("");
  const [mutationError, setMutationError] = useState("");

  const { data: products = [], loading, error: fetchError, reload } = useFetch(async () => {
    const { data } = await axios.get("/products/admin/all");
    return data || [];
  });

  // Surface either the fetch error or a mutation error.
  const error = mutationError || fetchError;

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setMutationError("");
      await axios.delete(`/products/${id}`);
      await reload();
    } catch (err) {
      setMutationError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleSave = async (productPayload) => {
    try {
      setMutationError("");
      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, productPayload);
      } else {
        await axios.post("/products", productPayload);
      }
      await reload();
      return true;
    } catch (err) {
      setMutationError(err.response?.data?.message || "Failed to save product");
      return false;
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="admin-products">
      <AdminPageHeader
        kicker="Catalog"
        title="Products"
        subtitle="Manage product details, pricing, listing media, and gallery media from one place."
        action={
          <button onClick={handleAdd} className="add-product-btn">
            Add Product
          </button>
        }
      />

      {error && <p className="admin-products-error">{error}</p>}

      {/* Search toolbar */}
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
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-table">
          <div className="products-table-head">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Actions</span>
          </div>

          {filteredProducts.map((product) => (
            <div key={product._id} className="products-table-row">
              <span className="product-cell">
                <img
                  className="product-thumb"
                  src={product.coverImage || product.images?.[0] || "https://via.placeholder.com/64?text=No+Img"}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/64?text=No+Img";
                  }}
                />
                <span>
                  {product.name}
                  {product.coverImage && <small className="product-cover-note">Listing image ready</small>}
                </span>
              </span>
              <span>{product.category || "-"}</span>
              <span>{formatCurrencyINR(product.price)}</span>
              <span className="actions">
                <button className="edit-btn" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(product._id)} className="delete-btn">
                  Delete
                </button>
              </span>
            </div>
          ))}

          {!filteredProducts.length && (
            <p className="admin-table-empty">No products matched your search.</p>
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
