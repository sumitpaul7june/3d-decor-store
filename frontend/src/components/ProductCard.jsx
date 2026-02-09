// Product tile with image, price, and add-to-cart action.
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";

function ProductCard({ product, type }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleCardClick = () => {
    navigate(`/products/${type}/${product.id}`);
  };

  const handleAddToCart = (e) => {
    // Prevent card click navigation when adding to cart.
    e.stopPropagation();
    dispatch(addToCart(
      {
        id: product.id,
      name: product.name,
      price: product.price,
      }
    ))
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
