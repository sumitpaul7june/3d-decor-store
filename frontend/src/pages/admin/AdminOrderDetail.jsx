// Dedicated admin order details page with timeline, customer info, and item breakdown.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import { getProductPresentation } from "../../utils/productPresentation";
import { buildOrderTimeline } from "../../utils/orderTracking";
import "./AdminOrderDetail.css";

function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/orders/${orderId}`);
      setOrder(data);
      setNote(data?.adminNote || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusSaving(true);
      setError("");
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      setNoteSaving(true);
      setError("");
      await axios.put(`/orders/${orderId}/admin-note`, { note });
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save admin note");
    } finally {
      setNoteSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-order-detail">
        <p className="admin-order-empty">Loading order details...</p>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="admin-order-detail">
        <p className="admin-order-error">{error}</p>
        <button type="button" className="admin-order-back" onClick={() => navigate("/admin/orders")}>
          Back to Orders
        </button>
      </section>
    );
  }

  const address = order?.addressSnapshot || {};
  const timelineSteps = buildOrderTimeline(order);

  return (
    <section className="admin-order-detail">
      <div className="admin-order-breadcrumbs">
        <Link to="/admin/orders">Orders</Link>
        <span>/</span>
        <span>#{order._id.slice(-8)}</span>
      </div>

      <article className="admin-order-hero">
        <div className="admin-order-hero-copy">
          <p className="admin-order-kicker">Order Details</p>
          <h1 className="admin-order-title">#{order._id.slice(-8)}</h1>
          <p className="admin-order-subtitle">
            Placed on {formatDateIN(order.createdAt)} by {order.user?.name || "Unknown customer"}.
          </p>

          <div className="admin-order-head-actions">
            <span className={`status-chip status-${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus}
            </span>
            <span className={`status-chip status-${(order.paymentStatus || "Pending").toLowerCase()}`}>
              {order.paymentStatus || "Pending"}
            </span>
          </div>
        </div>

        <div className="admin-order-hero-side">
          <div className="admin-order-hero-total">
            <span>Order Total</span>
            <strong>{formatCurrencyINR(order.totalAmount)}</strong>
          </div>

          <div className="admin-order-hero-meta">
            <span className={`status-chip status-${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus}
            </span>
            <span className={`status-chip status-${(order.paymentStatus || "Pending").toLowerCase()}`}>
              {order.paymentStatus || "Pending"}
            </span>
          </div>
        </div>
      </article>

      {error && <p className="admin-order-error">{error}</p>}

      <div className="admin-order-layout">
        <div className="admin-order-main">
          <article className="admin-order-panel">
            <div className="admin-order-panel-head">
              <h2>Progress Timeline</h2>
              {order.orderStatus === "Cancelled" && (
                <span className="timeline-note cancelled">Order cancelled</span>
              )}
            </div>

            <div className="order-timeline">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className={`timeline-step ${step.state}`}>
                  <div className="timeline-marker-wrap">
                    <span className="timeline-marker" />
                    {index < timelineSteps.length - 1 && <span className="timeline-line" />}
                  </div>
                <div className="timeline-copy">
                    <h3>{step.title}</h3>
                    <p>{step.meta}</p>
                    <small>{formatDateIN(step.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-order-panel">
            <div className="admin-order-panel-head">
              <h2>Items Ordered</h2>
              <span>{order.items?.length || 0} items</span>
            </div>

            <div className="admin-order-items">
              {(order.items || []).map((item, index) => {
                const product = item.product || {};
                const presentation = getProductPresentation({
                  ...product,
                  name: item.name || product.name,
                });

                return (
                  <div
                    key={`${order._id}-${item.product?._id || item.name}-${index}`}
                    className="admin-order-item"
                  >
                    <img
                      src={presentation.coverImage}
                      alt={item.name || "Ordered product"}
                      className="admin-order-item-image"
                    />

                    <div className="admin-order-item-copy">
                      <h3>{item.name || product.name || "Product"}</h3>
                      <p>
                        {(product.category || "Decor").toString()} • Qty {item.quantity}
                      </p>
                      <p>{formatCurrencyINR(item.price)} each</p>
                    </div>

                    <strong className="admin-order-item-total">
                      {formatCurrencyINR(item.price * item.quantity)}
                    </strong>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="admin-order-support-grid">
            <article className="admin-order-panel subtle">
              <div className="admin-order-panel-head">
                <h2>Payment Details</h2>
              </div>
              <div className="admin-order-info-block">
                <p>Transaction ID: {order.payment?.paymentId || "Not available"}</p>
                <p>Gateway Order: {order.payment?.orderId || "Not available"}</p>
                <p>Method: {order.payment?.method || "Not available"}</p>
                <p>Contact: {order.payment?.contact || "Not available"}</p>
                <p>Email: {order.payment?.email || "Not available"}</p>
                {order.payment?.failureReason && (
                  <p>Last failure: {order.payment.failureReason}</p>
                )}
              </div>
            </article>

            <article className="admin-order-panel subtle">
              <div className="admin-order-panel-head">
                <h2>Customer</h2>
              </div>
              <div className="admin-order-info-block">
                <h3>{order.user?.name || "Unknown customer"}</h3>
                <p>{order.user?.email || "No email available"}</p>
                <p>{address.phone || "No phone available"}</p>
              </div>
            </article>

            <article className="admin-order-panel subtle">
              <div className="admin-order-panel-head">
                <h2>Shipping Address</h2>
              </div>
              <div className="admin-order-info-block">
                <h3>{address.fullName || "No recipient name"}</h3>
                <p>{address.addressLine || "No address line"}</p>
                <p>
                  {[address.city, address.state, address.pincode].filter(Boolean).join(", ") ||
                    "No city/state details"}
                </p>
                <p>{address.country || "No country available"}</p>
              </div>
            </article>

            <article className="admin-order-panel subtle">
              <div className="admin-order-panel-head">
                <h2>Internal Note</h2>
              </div>
              <div className="admin-order-note-block">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note for fulfilment, payment follow-up, or customer support."
                />
                <button type="button" onClick={handleSaveNote} disabled={noteSaving}>
                  {noteSaving ? "Saving..." : "Save Note"}
                </button>
              </div>
            </article>
          </div>
        </div>

        <aside className="admin-order-sidebar">
          <article className="admin-order-panel accent">
            <div className="admin-order-panel-head">
              <h2>Order Control</h2>
            </div>

            <label className="admin-order-control">
              <span>Update status</span>
              <select
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusSaving}
              >
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </label>

            <div className="admin-order-summary-rows">
              <div>
                <span>Order total</span>
                <strong>{formatCurrencyINR(order.totalAmount)}</strong>
              </div>
              <div>
                <span>Payment</span>
                <strong>{order.paymentStatus || "Pending"}</strong>
              </div>
              <div>
                <span>Placed</span>
                <strong>{formatDateIN(order.createdAt)}</strong>
              </div>
            </div>

            <Link to={`/admin/orders/${orderId}/invoice`} className="admin-order-invoice-link">
              Print Invoice
            </Link>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default AdminOrderDetail;
