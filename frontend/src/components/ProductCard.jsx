import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product, type }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${type}/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log("Added to cart", product.id);
  };

  return (
    <div className="product" onClick={handleCardClick}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>

        <div className="price">
          <span className="current-price">₹{product.price}</span>
          <span className="original-price">₹{product.originalPrice}</span>
        </div>

        <button className="btn-primary" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
