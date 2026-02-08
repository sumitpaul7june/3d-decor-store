import { useState } from "react";
import stlProducts from "../../data/stlProducts";
import physicalProducts from "../../data/physicalProducts";
import ProductModal from "../../components/admin/ProductModal";
import "./AdminProducts.css";

function AdminProducts() {
  // ✅ Products MUST be state (so UI updates)
  const [products, setProducts] = useState([
    ...stlProducts,
    ...physicalProducts,
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  //  Add product
  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Delete Product
  const handleDelete = (id) => {
    setProducts((previousProducts) => previousProducts.filter((myProduct) => myProduct.id !== id));
  };
  
  // 💾 Save (Add OR Edit)
  const handleSave = (product) => {
    // EDIT
    if (editingProduct !== null) {
      setProducts((previousProducts) => {
        return previousProducts.map((existingProduct) => {
          if (existingProduct.id === editingProduct.id) {
            return {
              ...existingProduct,
              ...product,
            };
          }
          return existingProduct;
        });
      });
    }
    // ADD
    else {
      const newProduct = {
        id: Date.now(),
        ...product,
      };

      setProducts((previousProducts) => {
        return [...previousProducts, newProduct];
      });
    }
  };

  return (
    <section className="admin-products">
      {/* Header */}
      <div className="admin-products-header">
        <h1 className="admin-products-title">Products</h1>
        <button onClick={handleAdd} className="add-product-btn">
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="products-table">
        <div className="products-table-head">
          <span>Name</span>
          <span>Type</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>

        {products.map((product) => (
          <div key={product.id} className="products-table-row">
            <span>{product.name}</span>
            <span>{product.type}</span>
            <span>₹{product.price}</span>
            <span>{product.stock ?? "Unlimited"}</span>
            <span className="actions">
              <button
                className="edit-btn"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(product.id)} className="delete-btn">Delete</button>
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
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
