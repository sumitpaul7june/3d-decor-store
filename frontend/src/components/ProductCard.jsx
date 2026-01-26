import "./ProductCard.css";

function ProductCard() {
  return (
    <div className="product">
      <div className="product-image">
        <img src="product.jpg" alt="Product name" />
        <span className="badge">New</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">Chandelier</h3>

        <div className="price">
          <span className="current-price">₹999</span>
          <span className="original-price">₹1299</span>
        </div>

        <button className="btn-primary">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;
