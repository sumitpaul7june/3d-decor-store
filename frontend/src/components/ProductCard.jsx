import "./ProductCard.css";
function ProductCard({product}) {
  return (
    <div className="product">
      <div className="product-image">
        <img src={product.image} alt="Product name" />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>

        <div className="price">
          <span className="current-price">₹{product.price}</span>
          <span className="original-price">₹{product.originalPrice}</span>
        </div>

        <button className="btn-primary">Add to Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;
