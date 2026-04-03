// Track-order page: validate order id and take signed-in users to their real order timeline.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import "./StoreInfo.css";

function TrackOrder() {
  // Input and result state for order lookup.
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleTrack = async (e) => {
    e.preventDefault();

    const normalized = orderCode.trim().replace(/^#/, "");

    if (!normalized) {
      setError("Please enter an order id");
      return;
    }

    if (!isAuthenticated) {
      setError("Please sign in to track your order.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.get(`/orders/my-orders/${normalized}`);
      navigate(`/orders/my/${normalized}`);
    } catch (err) {
      setError(err.response?.data?.message || "Order not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="store-info-page">
      <article className="store-info-card">
        <p className="store-info-kicker">Orders</p>
        <h1 className="store-info-title">Track Order</h1>
        <p className="store-info-subtitle">
          Enter your order id to view the latest status.
        </p>

        <form className="track-form" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="Enter order id (example: 65f2c1a...)"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
          />
          <button type="submit">Track</button>
        </form>

        {error && <p className="track-error">{error}</p>}
        {loading && <p className="track-row">Checking your order...</p>}
      </article>
    </section>
  );
}

export default TrackOrder;
