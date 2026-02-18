// Checkout success page shown after order creation.
import { Link, useParams } from "react-router-dom";
import "./CheckoutSuccess.css";

function CheckoutSuccess() {
  // Read order id from URL: /checkout/success/:orderId
  const { orderId } = useParams();

  return (
    <section className="checkout-success-page">
      <article className="checkout-success-card">
        <p className="checkout-success-kicker">Checkout</p>
        <h2>Order placed successfully</h2>
        <p className="checkout-success-text">
          Your order has been created and is awaiting payment confirmation.
        </p>
        {/* Show order id only when present in URL */}
        {orderId && (
          <p className="checkout-success-order-id">
            <strong>Order ID:</strong> {orderId}
          </p>
        )}

        {/* Next actions after successful checkout */}
        <div className="checkout-success-actions">
          <Link to="/" className="checkout-success-btn primary">
            Continue Shopping
          </Link>
          <Link to="/orders/my" className="checkout-success-btn secondary">
            View My Orders
          </Link>
        </div>
      </article>
    </section>
  );
}

export default CheckoutSuccess;
