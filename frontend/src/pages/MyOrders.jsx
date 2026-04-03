// Customer orders page: premium order cards with quick actions and snapshots.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { clearCart } from "../store/cartSlice";
import { formatCurrencyINR, formatDateIN } from "../utils/formatters";
import { openRazorpayCheckout } from "../utils/razorpayCheckout";
import "./MyOrders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryingOrderId, setRetryingOrderId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/orders/my-orders");
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await axios.put(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleRetryPayment = async (order) => {
    await openRazorpayCheckout({
      orderId: order._id,
      selectedAddress: order.addressSnapshot,
      authUser,
      contactEmail: authUser?.email || "",
      onLoadingChange: (loadingState) => {
        setRetryingOrderId(loadingState ? order._id : "");
      },
      onError: setError,
      onSuccess: async () => {
        dispatch(clearCart());
        navigate(`/checkout/success/${order._id}`);
      },
    });
  };

  const totalSpend = orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingCount = orders.filter((order) => order.orderStatus === "Pending").length;
  const deliveredCount = orders.filter((order) => order.orderStatus === "Delivered").length;
  const cancelledCount = orders.filter((order) => order.orderStatus === "Cancelled").length;

  const getDeliveryLabel = (order) => {
    if (!order.addressSnapshot) return "Address unavailable";

    return [
      order.addressSnapshot.fullName,
      order.addressSnapshot.city,
      order.addressSnapshot.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getItemsPreview = (order) => {
    const items = order.items || [];

    if (!items.length) return "No items";
    if (items.length === 1) return items[0].name || "1 item";

    return `${items[0].name || "Item"} +${items.length - 1} more`;
  };

  const toggleDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <section className="my-orders-page">
        <p className="my-orders-kicker">Orders</p>
        <h2>My Orders</h2>
        <p>Loading orders...</p>
      </section>
    );
  }

  return (
    <section className="my-orders-page">
      <div className="my-orders-head">
        <div>
          <p className="my-orders-kicker">Orders</p>
          <h2>My Orders</h2>
          <p className="my-orders-subtitle">
            Follow each order through payment, fulfilment, and delivery in one calm place.
          </p>
        </div>
      </div>

      {error && <p className="my-orders-error">{error}</p>}

      <div className="my-orders-metrics">
        <article className="my-orders-metric feature">
          <p>Total Spend</p>
          <strong>{formatCurrencyINR(totalSpend)}</strong>
        </article>
        <article className="my-orders-metric">
          <p>Total Orders</p>
          <strong>{orders.length}</strong>
        </article>
        <article className="my-orders-metric">
          <p>Pending</p>
          <strong>{pendingCount}</strong>
        </article>
        <article className="my-orders-metric">
          <p>Delivered</p>
          <strong>{deliveredCount}</strong>
        </article>
        <article className="my-orders-metric">
          <p>Cancelled</p>
          <strong>{cancelledCount}</strong>
        </article>
      </div>

      {orders.length === 0 ? (
        <p className="my-orders-empty">You do not have any orders yet.</p>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => (
            <article key={order._id} className="my-order-card">
              <div className="my-order-card-top">
                <div className="my-order-card-copy">
                  <p className="my-order-card-kicker">Order #{order._id.slice(-8)}</p>
                  <h3 className="my-order-card-title">{getItemsPreview(order)}</h3>
                  <p className="my-order-card-subtitle">
                    Placed on {formatDateIN(order.createdAt)}
                  </p>
                </div>

                <div className="my-order-card-head-side">
                  <div className="my-order-card-chips">
                    <span className={`payment-chip payment-${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`my-order-status status-${order.orderStatus?.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="my-order-card-total">
                    <span>Total</span>
                    <strong>{formatCurrencyINR(order.totalAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="my-order-card-meta">
                <div className="my-order-meta-pill">
                  <span className="my-order-meta-label">Delivery</span>
                  <strong>{getDeliveryLabel(order)}</strong>
                </div>
                <div className="my-order-meta-pill">
                  <span className="my-order-meta-label">Items</span>
                  <strong>
                    {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
                  </strong>
                </div>
                <div className="my-order-meta-pill">
                  <span className="my-order-meta-label">Reference</span>
                  <strong className="my-order-id">#{order._id.slice(-8)}</strong>
                </div>
              </div>

              <div className="my-order-card-actions">
                <div className="my-order-card-actions-primary">
                  <Link className="order-view-link" to={`/orders/my/${order._id}`}>
                    View Order
                  </Link>

                  <button
                    className="order-details-btn"
                    onClick={() => toggleDetails(order._id)}
                  >
                    {expandedOrderId === order._id ? "Hide Snapshot" : "Quick View"}
                  </button>
                </div>

                <div className="my-order-card-actions-secondary">
                  {order.paymentStatus !== "Paid" && order.orderStatus !== "Cancelled" && (
                    <button
                      className="order-details-btn"
                      onClick={() => handleRetryPayment(order)}
                      disabled={retryingOrderId === order._id}
                    >
                      {retryingOrderId === order._id ? "Opening..." : "Retry Payment"}
                    </button>
                  )}

                  {order.orderStatus === "Pending" && (
                    <button
                      className="my-order-cancel-btn"
                      onClick={() => handleCancel(order._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {expandedOrderId === order._id && (
                <div className="order-row-details">
                  {!!order.items?.length && (
                    <div className="details-block details-block-items">
                      <p className="details-title">Items</p>
                      <div className="details-items">
                        {order.items.map((item, index) => (
                          <div key={`${order._id}-${index}`} className="my-order-item-row">
                            <div className="my-order-item-meta">
                              <span>{item.name || "Product"}</span>
                              <small>Qty {item.quantity}</small>
                            </div>
                            <strong>
                              {formatCurrencyINR((item.price || 0) * (item.quantity || 0))}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.addressSnapshot && (
                    <div className="details-block">
                      <p className="details-title">Shipping Address</p>
                      <p className="my-order-address">
                        {order.addressSnapshot.fullName}, {order.addressSnapshot.addressLine},{" "}
                        {order.addressSnapshot.city}, {order.addressSnapshot.country}
                      </p>
                    </div>
                  )}

                  {order.payment?.failureReason && (
                    <div className="details-block">
                      <p className="details-title">Payment Update</p>
                      <p className="my-order-address">{order.payment.failureReason}</p>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyOrders;
