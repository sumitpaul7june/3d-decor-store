import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFetch } from "../hooks/useFetch";
import axios from "../api/axios";
import { clearCart } from "../store/cartSlice";
import { formatCurrencyINR, formatDateIN } from "../utils/formatters";
import { openRazorpayCheckout } from "../utils/razorpayCheckout";
import "./MyOrders.css";

function MyOrders() {
  const [retryingOrderId, setRetryingOrderId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const { data: rawOrders = [], loading, error, reload } = useFetch(async () => {
    const { data } = await axios.get("/orders/my-orders");
    return data || [];
  });
  const orders = rawOrders || [];

  const handleRetryPayment = async (order) => {
    await openRazorpayCheckout({
      orderId: order._id,
      selectedAddress: order.addressSnapshot,
      authUser,
      contactEmail: authUser?.email || "",
      onLoadingChange: (loadingState) => {
        setRetryingOrderId(loadingState ? order._id : "");
      },
      onError: (err) => {
        console.error("Payment retry failed:", err);
        // Could expand this to set a local retryError state if we want to show it in the UI instead of the main page error
      },
      onSuccess: async () => {
        dispatch(clearCart());
        navigate(`/checkout/success/${order._id}`);
      },
    });
  };

  const getItemsPreview = (order) => {
    const items = order.items || [];
    if (!items.length) return "Empty Order";
    if (items.length === 1) return items[0].name || "1 item";
    return `${items[0].name || "Item"} and ${items.length - 1} other item(s)`;
  };

  if (loading) {
    return (
      <section className="my-orders-page loading">
        <div className="orders-container">
          <p className="orders-kicker">Account</p>
          <h2>Order History</h2>
          <div className="orders-divider"></div>
          <p>Retrieving your orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-orders-page">
      <div className="orders-container">
        <header className="orders-header">
          <p className="orders-kicker">Account</p>
          <h2>Order History</h2>
          <p className="orders-subtitle">
            View the status of your recent purchases and arrange returns.
          </p>
        </header>

        <div className="orders-divider"></div>

        {error && <p className="orders-error">{error}</p>}

        {orders.length === 0 ? (
          <p className="orders-empty">You haven't placed any orders yet.</p>
        ) : (
          <div className="orders-feed">
            {orders.map((order) => (
              <article key={order._id} className="order-row">
                <div className="order-row-main">
                  
                  {/* Left block: details */}
                  <div className="order-info">
                    <div className="order-reference">
                      <span>Order No.</span>
                      <strong>{order._id.slice(-8).toUpperCase()}</strong>
                    </div>
                    <h3 className="order-items-preview">{getItemsPreview(order)}</h3>
                    <p className="order-date">Placed on {formatDateIN(order.createdAt)}</p>
                  </div>

                  {/* Middle block: Status */}
                  <div className="order-status-block">
                    <div className="status-item">
                      <span>Status</span>
                      <strong className={`status-text ${order.orderStatus?.toLowerCase()}`}>
                        {order.orderStatus}
                      </strong>
                    </div>
                    <div className="status-item">
                      <span>Payment</span>
                      <strong className={`status-text ${order.paymentStatus?.toLowerCase()}`}>
                        {order.paymentStatus}
                      </strong>
                    </div>
                  </div>

                  {/* Right block: Total and Actions */}
                  <div className="order-total-actions">
                    <div className="order-total">
                      <span>Total</span>
                      <strong>{formatCurrencyINR(order.totalAmount)}</strong>
                    </div>
                    
                    <div className="order-actions">
                      <Link className="btn-view" to={`/orders/my/${order._id}`}>
                        View Details
                      </Link>

                      {order.paymentStatus !== "Paid" && order.orderStatus !== "Cancelled" && (
                        <button
                          className="btn-retry"
                          onClick={() => handleRetryPayment(order)}
                          disabled={retryingOrderId === order._id}
                        >
                          {retryingOrderId === order._id ? "Processing..." : "Complete Payment"}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyOrders;
