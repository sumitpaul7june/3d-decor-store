import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axios";
import { clearCart } from "../store/cartSlice";
import { formatCurrencyINR, formatDateIN } from "../utils/formatters";
import { getProductPresentation } from "../utils/productPresentation";
import { buildOrderTimeline } from "../utils/orderTracking";
import { openRazorpayCheckout } from "../utils/razorpayCheckout";
import "./OrderDetail.css";

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/orders/my-orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    try {
      setError("");
      await axios.put(`/orders/${order._id}/cancel`);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleRetryPayment = async () => {
    await openRazorpayCheckout({
      orderId: order._id,
      selectedAddress: order.addressSnapshot,
      authUser,
      contactEmail: authUser?.email || "",
      onLoadingChange: setPaymentLoading,
      onError: setError,
      onSuccess: async () => {
        dispatch(clearCart());
        navigate(`/checkout/success/${order._id}`);
      },
    });
  };

  if (loading) {
    return (
      <section className="order-detail-page">
        <p className="order-detail-empty">Loading order details...</p>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className="order-detail-page">
        <p className="order-detail-error">{error}</p>
      </section>
    );
  }

  const timeline = buildOrderTimeline(order);
  const address = order.addressSnapshot || {};
  const canRetryPayment =
    order.paymentStatus !== "Paid" && order.orderStatus !== "Cancelled";

  return (
    <section className="order-detail-page">
      <div className="order-detail-breadcrumbs">
        <Link to="/orders/my">My Orders</Link>
        <span>/</span>
        <span>#{order._id.slice(-8)}</span>
      </div>

      <article className="order-detail-hero">
        <div className="order-detail-hero-copy">
          <p className="order-detail-kicker">Order Details</p>
          <h1>#{order._id.slice(-8)}</h1>
          <p className="order-detail-subtitle">
            Placed on {formatDateIN(order.createdAt)} • {order.items?.length || 0} item
            {order.items?.length === 1 ? "" : "s"} in your QALARAHI order.
          </p>

          <div className="order-detail-hero-chips">
            <span className={`order-status-chip status-${order.orderStatus?.toLowerCase()}`}>
              {order.orderStatus}
            </span>
            <span className={`payment-status-chip payment-${order.paymentStatus?.toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        <div className="order-detail-hero-side">
          <div className="order-detail-hero-total">
            <span>Order Total</span>
            <strong>{formatCurrencyINR(order.totalAmount)}</strong>
          </div>

          <div className="order-detail-action-stack">
            {canRetryPayment && (
              <button
                type="button"
                className="order-primary-btn"
                onClick={handleRetryPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Opening payment..." : "Retry Payment"}
              </button>
            )}

            {order.orderStatus === "Pending" && (
              <button
                type="button"
                className="order-secondary-btn"
                onClick={handleCancel}
              >
                Cancel Order
              </button>
            )}

            <Link
              to={`/orders/my/${order._id}/invoice`}
              className="order-secondary-btn order-link-btn"
            >
              View Invoice
            </Link>
          </div>
        </div>
      </article>

      {error && <p className="order-detail-error">{error}</p>}

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <article className="order-detail-card">
            <div className="order-detail-card-head">
              <h2>Tracking Timeline</h2>
            </div>

            <div className="order-timeline-list">
              {timeline.map((step, index) => (
                <div key={`${step.title}-${index}`} className="order-timeline-row">
                  <div className="order-timeline-marker-wrap">
                    <span className="order-timeline-marker" />
                    {index < timeline.length - 1 && <span className="order-timeline-line" />}
                  </div>
                  <div className="order-timeline-copy">
                    <h3>{step.title}</h3>
                    <p>{step.meta}</p>
                    <small>{formatDateIN(step.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="order-detail-card">
            <div className="order-detail-card-head">
              <h2>Items</h2>
              <span>{order.items?.length || 0} items</span>
            </div>

            <div className="order-detail-items">
              {(order.items || []).map((item, index) => {
                const presentation = getProductPresentation({
                  ...(item.product || {}),
                  name: item.name || item.product?.name,
                });

                return (
                  <div
                    key={`${order._id}-${item.product?._id || item.name}-${index}`}
                    className="order-detail-item"
                  >
                    <img
                      src={presentation.coverImage}
                      alt={item.name || "Ordered item"}
                      className="order-detail-item-image"
                    />

                    <div className="order-detail-item-copy">
                      <h3>{item.name || "Product"}</h3>
                      <p>Qty {item.quantity}</p>
                      <p>{formatCurrencyINR(item.price)} each</p>
                    </div>

                    <strong className="order-detail-item-total">
                      {formatCurrencyINR((item.price || 0) * (item.quantity || 0))}
                    </strong>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <aside className="order-detail-sidebar">
          <article className="order-detail-card subtle">
            <div className="order-detail-card-head">
              <h2>Payment</h2>
            </div>
            <div className="order-detail-info">
              <div>
                <span>Status</span>
                <strong>{order.paymentStatus || "Pending"}</strong>
              </div>
              <div>
                <span>Transaction ID</span>
                <strong>{order.payment?.paymentId || "Not available"}</strong>
              </div>
              <div>
                <span>Gateway Order</span>
                <strong>{order.payment?.orderId || "Not available"}</strong>
              </div>
              <div>
                <span>Method</span>
                <strong>{order.payment?.method || "Not available"}</strong>
              </div>
              {order.payment?.failureReason && (
                <div>
                  <span>Last failure</span>
                  <strong>{order.payment.failureReason}</strong>
                </div>
              )}
            </div>
          </article>

          <article className="order-detail-card subtle">
            <div className="order-detail-card-head">
              <h2>Shipping Address</h2>
            </div>
            <div className="order-detail-info address">
              <p><strong>{address.fullName || "-"}</strong></p>
              <p>{address.addressLine || "-"}</p>
              <p>
                {[address.city, address.state, address.pincode].filter(Boolean).join(", ") || "-"}
              </p>
              <p>{address.country || "-"}</p>
              <p>{address.phone || "-"}</p>
            </div>
          </article>

          <article className="order-detail-card subtle">
            <div className="order-detail-card-head">
              <h2>Summary</h2>
            </div>
            <div className="order-detail-summary">
              <div>
                <span>Order Total</span>
                <strong>{formatCurrencyINR(order.totalAmount)}</strong>
              </div>
              <div>
                <span>Placed</span>
                <strong>{formatDateIN(order.createdAt)}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default OrderDetail;
