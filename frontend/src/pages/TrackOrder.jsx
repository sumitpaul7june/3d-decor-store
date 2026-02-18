// Mock track-order page with simple input and demo result.
import { useState } from "react";
import "./StoreInfo.css";

function TrackOrder() {
  // Input and result state for mock tracking.
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();

    const normalized = orderCode.trim();

    if (!normalized) {
      setError("Please enter an order id");
      setResult(null);
      return;
    }

    setError("");

    // Mock tracking result for demo UI.
    setResult({
      orderId: normalized.startsWith("#") ? normalized : `#${normalized}`,
      status: "Shipped",
      updatedAt: new Date().toLocaleString("en-IN"),
      destination: "Mumbai, India",
      message: "Package is in transit to nearest delivery hub."
    });
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

        {result && (
          <div className="track-result">
            <p className="track-row">
              Order: <strong>{result.orderId}</strong>
            </p>
            <p className="track-row">
              Status: <span className="track-status-chip">{result.status}</span>
            </p>
            <p className="track-row">
              Last update: <strong>{result.updatedAt}</strong>
            </p>
            <p className="track-row">
              Destination: <strong>{result.destination}</strong>
            </p>
            <p className="track-row">{result.message}</p>
          </div>
        )}
      </article>
    </section>
  );
}

export default TrackOrder;
