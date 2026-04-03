import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "../../api/axios";
import InvoiceDocument from "../../components/orders/InvoiceDocument";
import "./AdminOrderInvoice.css";

function AdminOrderInvoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`/orders/${orderId}`);
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
    <section className="admin-order-invoice-page">
      <div className="admin-order-invoice-toolbar">
        <div className="admin-order-invoice-toolbar-copy">
          <p className="admin-order-invoice-toolbar-kicker">Admin Invoice</p>
          <h1 className="admin-order-invoice-toolbar-title">Order Invoice</h1>
          <p className="admin-order-invoice-toolbar-subtitle">
            Print a polished invoice for packing, dispatch, or support records.
          </p>
        </div>

        <div className="admin-order-invoice-toolbar-actions">
          <Link
            to={`/admin/orders/${orderId}`}
            className="admin-order-invoice-back-link"
          >
            Back to Order
          </Link>
          {order && (
            <button
              type="button"
              className="admin-order-invoice-print-btn"
              onClick={() => window.print()}
            >
              Print Invoice
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="admin-order-invoice-empty">Loading invoice...</p>
      ) : error ? (
        <p className="admin-order-invoice-error">{error}</p>
      ) : (
        <InvoiceDocument order={order} title="Order Invoice" subtitle="QALARAHI Admin" />
      )}
    </section>
  );
}

export default AdminOrderInvoice;
