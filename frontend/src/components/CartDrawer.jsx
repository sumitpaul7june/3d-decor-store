import { useSelector, useDispatch } from "react-redux";
import { increaseQty, decreaseQty } from "../store/cartSlice";
import { removeCart } from "../store/cartSlice";

import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className={`cart-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-header">
          <div>
            <h3>My Cart</h3>
            <span className="cart-subtext">{items.length} items</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body*/}
        <div className="cart-body">

       
          {
            items.length === 0 ? (
                <div className="empty-cart">
                  <p className="empty-title">Your cart is empty</p>
                  <p className="empty-subtext">
                    Looks like you haven’t added anything yet
                  </p>
                  <button
                    className="browse-btn"
                    onClick={onClose}
                  >
                    Continue shopping
                  </button>
                </div>
              )
          
          : (items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <p className="name">{item.name}</p>
                <p className="price">₹{item.price}</p>
                <button
                  className="remove-btn"
                  onClick={() => dispatch(removeCart(item.id))}
                >
                  Remove
                </button>
              </div>

              <div className="cart-qty">
                <button onClick={() => dispatch(decreaseQty(item.id))}>
                  -
                </button>
                <span>{item.qty}</span>
                <button onClick={() => dispatch(increaseQty(item.id))}>
                  +
                </button>
              </div>
            </div>
          )))}


        </div>

        {/* Footer */}
        <div className="cart-footer">
          <div className="subtotal">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>
          <button className="checkout-btn">Checkout</button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
