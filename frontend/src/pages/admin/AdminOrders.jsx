// Admin orders page: view, filter, and update order statuses.
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import { getProductPresentation } from "../../utils/productPresentation";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import "./AdminOrders.css";

function AdminOrders() {
  // Filter UI state lives here; data comes from the hook.
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: rawOrders = [], loading, error, reload } = useFetch(async () => {
    const { data } = await axios.get("/orders");
    return data || [];
  });
  const orders = rawOrders || [];

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/orders/${id}/status`, { status: newStatus });
      await reload();
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to update order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = query.trim().toLowerCase();
    const orderId = order._id?.toLowerCase() || "";
    const customer = order.user?.name?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const phone = order.addressSnapshot?.phone?.toLowerCase() || "";
    const matchesQuery =
      !q ||
      orderId.includes(q) ||
      customer.includes(q) ||
      email.includes(q) ||
      phone.includes(q);
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pendingCount = orders.filter((order) => order.orderStatus === "Pending").length;
  const paidCount = orders.filter((order) => order.paymentStatus === "Paid").length;

  return (
    <section className="admin-orders">
      <AdminPageHeader
        kicker="Fulfilment"
        title="Orders"
        subtitle="Review every order, update status, and open the full detail view."
      />

      {error && <p className="admin-orders-error">{error}</p>}

      <div className="orders-summary-grid">
        <article className="orders-summary-card">
          <p className="orders-summary-label">Total Orders</p>
          <strong>{orders.length}</strong>
        </article>
        <article className="orders-summary-card">
          <p className="orders-summary-label">Pending</p>
          <strong>{pendingCount}</strong>
        </article>
        <article className="orders-summary-card">
          <p className="orders-summary-label">Paid</p>
          <strong>{paidCount}</strong>
        </article>
        <article className="orders-summary-card">
          <p className="orders-summary-label">Shown</p>
          <strong>{filteredOrders.length}</strong>
        </article>
      </div>

      <div className="admin-orders-toolbar">
        <input
          className="orders-search-input"
          type="text"
          placeholder="Search by order id, customer, or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="orders-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="admin-table-empty">Loading orders...</p>
      ) : !filteredOrders.length ? (
        <p className="admin-table-empty">
          No orders matched your search or filter.
        </p>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const previewItems = (order.items || []).slice(0, 3);
            const remainingItems = Math.max((order.items?.length || 0) - 3, 0);
            const locationLine = [
              order.addressSnapshot?.city,
              order.addressSnapshot?.state,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <article key={order._id} className="order-card">
                <div className="order-card-top">
                  <div>
                    <p className="order-card-kicker">Order #{order._id.slice(-8)}</p>
                    <h2 className="order-card-customer">
                      {order.user?.name || "Unknown customer"}
                    </h2>
                    <p className="order-card-meta">
                      {order.user?.email || "No email"} • {formatDateIN(order.createdAt)}
                    </p>
                  </div>

                  <div className="order-card-amount">
                    <span>Total</span>
                    <strong>{formatCurrencyINR(order.totalAmount)}</strong>
                  </div>
                </div>

                <div className="order-card-middle">
                  <div className="order-card-preview">
                    <div className="order-preview-stack">
                      {previewItems.map((item, index) => {
                        const product = item.product || {};
                        const previewProduct = { ...product, name: item.name || product.name };
                        const previewImage = getProductPresentation(previewProduct).coverImage;

                        return (
                          <img
                            key={`${order._id}-${item.product?._id || item.name}-${index}`}
                            src={previewImage}
                            alt={item.name || "Ordered product"}
                            className="order-preview-thumb"
                          />
                        );
                      })}
                    </div>

                    <div>
                      <p className="order-preview-title">
                        {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
                        {remainingItems > 0 ? ` • +${remainingItems} more` : ""}
                      </p>
                      <p className="order-preview-subtitle">
                        {locationLine || "Address available in details"}
                      </p>
                    </div>
                  </div>

                  <div className="order-card-statuses">
                    <span className={`status-chip status-${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                    <span
                      className={`status-chip status-${(order.paymentStatus || "Pending").toLowerCase()}`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="order-card-actions">
                  <select
                    className="orders-status-select"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>

                  <Link to={`/admin/orders/${order._id}`} className="orders-open-link">
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminOrders;
