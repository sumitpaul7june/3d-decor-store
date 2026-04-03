import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../api/axios";
import InvoiceDocument from "../components/orders/InvoiceDocument";
import "./OrderInvoice.css";

function OrderInvoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`/orders/my-orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <section className="order-invoice-page">
      <div className="order-invoice-toolbar">
        <div className="order-invoice-toolbar-copy">
          <p className="order-invoice-toolbar-kicker">Invoice</p>
          <h1 className="order-invoice-toolbar-title">Customer Invoice</h1>
          <p className="order-invoice-toolbar-subtitle">
            Save or print a clean copy for your records.
          </p>
        </div>

        <div className="order-invoice-toolbar-actions">
          <Link to={`/orders/my/${orderId}`} className="order-invoice-back-link">
            Back to Order
          </Link>
          {order && (
            <button
              type="button"
              className="order-invoice-print-btn"
              onClick={() => window.print()}
            >
              Print Invoice
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="order-invoice-empty">Loading invoice...</p>
      ) : error ? (
        <p className="order-invoice-error">{error}</p>
      ) : (
        <InvoiceDocument order={order} title="Customer Invoice" subtitle="QALARAHI" />
      )}
    </section>
  );
}

export default OrderInvoice;
