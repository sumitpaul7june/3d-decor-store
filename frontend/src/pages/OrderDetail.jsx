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

  const [existingReturn, setExistingReturn] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState("Damaged / Defective");
  const [returnNote, setReturnNote] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  const [activeReviewProductId, setActiveReviewProductId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  const handleReviewToggle = async (productId) => {
    setActiveReviewProductId(productId);
    setReviewMsg("");
    setReviewForm({ rating: 5, comment: "" });
    setHasExistingReview(false);
    
    try {
      setSubmittingReview(true);
      const { data } = await axios.get(`/reviews/user/${productId}`);
      if (data && data._id) {
        setReviewForm({ rating: data.rating, comment: data.comment });
        setHasExistingReview(true);
      }
    } catch (e) {
      // ignore
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (productId) => {
    try {
      setSubmittingReview(true);
      await axios.delete(`/reviews/${productId}`);
      setReviewMsg("Review deleted successfully!");
      setHasExistingReview(false);
      setTimeout(() => {
        setActiveReviewProductId(null);
        setReviewMsg("");
      }, 2000);
    } catch (err) {
      setReviewMsg("Failed to delete review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      setReviewMsg("");
      await axios.post(`/reviews/${productId}`, reviewForm);
      setReviewMsg("Review submitted successfully!");
      setReviewForm({ rating: 5, comment: "" });
      setTimeout(() => {
        setActiveReviewProductId(null);
        setReviewMsg("");
      }, 2000);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/orders/my-orders/${orderId}`);
      setOrder(data);

      const returnRes = await axios.get(`/returns/order/${orderId}`);
      setExistingReturn(returnRes.data);
    } catch (err) {
      if (err.response?.status !== 404 || err.response?.data?.message !== "No return found for this order") {
        setError(err.response?.data?.message || "Failed to load order details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setReturnLoading(true);
      setError("");
      const payload = {
        orderId: order._id,
        reason: returnReason,
        customerNote: returnNote,
        items: order.items.map(i => ({
          product: i.product?._id || i.product,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      };
      const { data } = await axios.post("/returns", payload);
      setExistingReturn(data.returnRequest);
      setShowReturnForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit return request");
    } finally {
      setReturnLoading(false);
    }
  };

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
  const canReturn = order.orderStatus === "Delivered" && !existingReturn;

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

            {/* Return Management UI */}
            {existingReturn && (
              <div className="order-return-status-box">
                <h4>Return Status</h4>
                {existingReturn.status === "Rejected" ? (
                   <div className="return-rejected-box">
                     <p>Your return request was <strong>Rejected</strong>.</p>
                     <p>Please contact support for more details.</p>
                   </div>
                ) : (
                   <div className="return-stepper">
                     {["Requested", "Approved", "Picked Up", "Refunded"].map((step, idx) => {
                        const statuses = ["Requested", "Approved", "Picked Up", "Refunded"];
                        const currentIdx = statuses.indexOf(existingReturn.status);
                        const isCompleted = idx <= currentIdx;
                        return (
                          <div key={idx} className={`return-step ${isCompleted ? 'completed' : ''}`}>
                             <div className="return-step-marker"></div>
                             {idx < statuses.length - 1 && <div className="return-step-line"></div>}
                             <p>{step}</p>
                          </div>
                        )
                     })}
                   </div>
                )}
                {existingReturn.refundAmount > 0 && (
                  <div className="return-refund-amt">
                    <span>Refund Issued</span>
                    <strong>{formatCurrencyINR(existingReturn.refundAmount)}</strong>
                  </div>
                )}
              </div>
            )}

            {canReturn && !showReturnForm && (
              <button 
                type="button" 
                className="order-secondary-btn"
                onClick={() => setShowReturnForm(true)}
              >
                Request a Return
              </button>
            )}

            {showReturnForm && (
              <form onSubmit={handleReturnSubmit} className="order-return-form">
                <h4>Request Return</h4>
                <label>
                  <span>Reason</span>
                  <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                    <option>Damaged / Defective</option>
                    <option>Incorrect Item Sent</option>
                    <option>Quality did not meet expectations</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span>Note (Optional)</span>
                  <textarea 
                    value={returnNote} 
                    onChange={(e) => setReturnNote(e.target.value)} 
                    placeholder="Provide details..."
                    rows="3"
                  />
                </label>
                <div className="return-form-acts">
                  <button type="submit" className="order-primary-btn" disabled={returnLoading}>
                    {returnLoading ? "..." : "Submit Return"}
                  </button>
                  <button 
                    type="button" 
                    className="order-secondary-btn" 
                    onClick={() => setShowReturnForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
      </article>

      {error && <p className="order-detail-error">{error}</p>}

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <article className="order-detail-card">
            <div className="order-detail-card-head">
              <h2>Tracking Timeline</h2>
              {order.trackingLink && (
                <a href={order.trackingLink} target="_blank" rel="noreferrer" className="order-tracking-btn">
                  Track Package →
                </a>
              )}
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
                  <div key={`${order._id}-${item.product?._id || item.name}-${index}`}>
                    <div className="order-detail-item">
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

                    {order.orderStatus === "Delivered" && (
                      <div className="order-detail-review-section">
                        {activeReviewProductId !== (item.product?._id || item.product) ? (
                          <button 
                            className="order-review-toggle-btn"
                            onClick={() => handleReviewToggle(item.product?._id || item.product)}
                          >
                            Review / Edit
                          </button>
                        ) : (
                          <form className="order-review-form" onSubmit={(e) => handleReviewSubmit(e, item.product?._id || item.product)}>
                            <h4>{hasExistingReview ? "Update your Review" : `Write a Review for ${item.name}`}</h4>
                            <select 
                              value={reviewForm.rating} 
                              onChange={e => setReviewForm(prev => ({...prev, rating: e.target.value}))}
                            >
                               <option value="5">5 - Excellent</option>
                               <option value="4">4 - Good</option>
                               <option value="3">3 - Okay</option>
                               <option value="2">2 - Poor</option>
                               <option value="1">1 - Terrible</option>
                            </select>
                            <textarea 
                              rows="3" 
                              required
                              placeholder="What did you think of this piece?"
                              value={reviewForm.comment}
                              onChange={e => setReviewForm(prev => ({...prev, comment: e.target.value}))}
                            />
                            {reviewMsg && <p className="order-review-msg">{reviewMsg}</p>}
                            <div className="order-review-acts">
                               <button type="submit" disabled={submittingReview}>
                                 {submittingReview ? "Submitting..." : hasExistingReview ? "Update Review" : "Submit Review"}
                               </button>
                               {hasExistingReview && (
                                  <button type="button" style={{color: "#a80000", textDecoration: "none"}} onClick={() => handleDeleteReview(item.product?._id || item.product)}>
                                    Delete
                                  </button>
                               )}
                               <button type="button" onClick={() => setActiveReviewProductId(null)}>Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
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
              {order.refundStatus && order.refundStatus !== "None" && (
                <div>
                  <span>Refund</span>
                  <strong className={`refund-status-${order.refundStatus.toLowerCase()}`}>{order.refundStatus}</strong>
                </div>
              )}
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
