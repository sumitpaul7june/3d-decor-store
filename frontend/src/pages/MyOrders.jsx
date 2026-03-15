// Customer orders page: summary metrics + order list with expandable details.
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { formatCurrencyINR, formatDateIN } from "../utils/formatters";
import "./MyOrders.css";

function MyOrders() {
  // Orders list and page UI states.
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    // Load current user's orders.
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
    // Allow cancel only for pending orders.
    try {
      await axios.put(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const totalSpend = orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  // High-level KPI counts for top insight cards.
  const pendingCount = orders.filter((order) => order.orderStatus === "Pending").length;
  const deliveredCount = orders.filter((order) => order.orderStatus === "Delivered").length;
  const cancelledCount = orders.filter((order) => order.orderStatus === "Cancelled").length;

  const getDeliveryLabel = (order) => {
    // Compact delivery label for table row preview.
    if (!order.addressSnapshot) return "Address unavailable";
    return [
      order.addressSnapshot.fullName,
      order.addressSnapshot.city,
      order.addressSnapshot.country
    ]
      .filter(Boolean)
      .join(", ");
  };

  const toggleDetails = (orderId) => {
    // Toggle expanded details panel for one order at a time.
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
      {/* Page heading */}
      <div className="my-orders-head">
        <p className="my-orders-kicker">Orders</p>
        <h2>My Orders</h2>
        <p className="my-orders-subtitle">
          Track status, payment and delivery details for each order.
        </p>
      </div>
      {error && <p className="my-orders-error">{error}</p>}

      {/* Top KPI cards */}
      <div className="my-orders-metrics">
        <article className="my-orders-metric">
          <p>Total Orders</p>
          <strong>{orders.length}</strong>
        </article>
        <article className="my-orders-metric">
          <p>Total Spend</p>
          <strong>{formatCurrencyINR(totalSpend)}</strong>
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
      <div className="my-orders-section-divider" />

      {orders.length === 0 ? (
        <p className="my-orders-empty">You do not have any orders yet.</p>
      ) : (
        // Desktop-style order list/table layout.
        <div className="orders-table-shell">
          <div className="orders-table-head">
            <span>Order</span>
            <span>Delivery</span>
            <span>Items</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {orders.map((order) => (
            // One order row with optional expanded details.
            <article key={order._id} className="order-row">
              <div className="order-row-main">
                <div className="order-col order-col-meta">
                  <p className="my-order-id">#{order._id.slice(-8)}</p>
                  <p className="my-order-date">{formatDateIN(order.createdAt)}</p>
                </div>

                <p className="order-col order-col-delivery">{getDeliveryLabel(order)}</p>
                <p className="order-col">{order.items?.length || 0}</p>
                <p className="order-col order-col-total">{formatCurrencyINR(order.totalAmount)}</p>

                <div className="order-col">
                  <span className={`payment-chip payment-${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="order-col">
                  <span className={`my-order-status status-${order.orderStatus?.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-col order-actions">
                  <button
                    className="order-details-btn"
                    onClick={() => toggleDetails(order._id)}
                  >
                    {expandedOrderId === order._id ? "Hide" : "Details"}
                  </button>

                  {order.orderStatus === "Pending" && (
                    // Cancel is only allowed while pending.
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
                    <div className="details-block">
                      <p className="details-title">Items</p>
                      <div className="details-items">
                        {order.items.map((item, index) => (
                          <div key={`${order._id}-${index}`} className="my-order-item-row">
                            <div className="my-order-item-meta">
                              <span>
                                {item.name || "Product"} • Qty {item.quantity}
                              </span>
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
