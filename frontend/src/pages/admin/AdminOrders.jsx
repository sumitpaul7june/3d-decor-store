// Admin orders page: view, filter, and update order statuses.
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import "./AdminOrders.css";

function AdminOrders() {
  // Orders table data + filter states.
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    // Load all orders for admin management.
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("/orders");
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

  const handleStatusChange = async (id, newStatus) => {
    // Persist status updates directly to backend.
    try {
      await axios.put(`/orders/${id}/status`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Match by text query (order id/customer) + selected status.
    const q = query.trim().toLowerCase();
    const orderId = order._id?.toLowerCase() || "";
    const customer = order.user?.name?.toLowerCase() || "";
    const matchesQuery = !q || orderId.includes(q) || customer.includes(q);
    const matchesStatus =
      statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pendingCount = orders.filter(
    (order) => order.orderStatus === "Pending"
  ).length;

  return (
    <section className="admin-orders">
      {/* Page header */}
      <div className="admin-page-head">
        <div>
          <p className="admin-page-kicker">Fulfilment</p>
          <h1 className="admin-orders-title">Orders</h1>
          <p className="admin-page-subtitle">
            Track and update order status from one queue.
          </p>
        </div>
      </div>
      {error && <p className="admin-orders-error">{error}</p>}

      {/* Search + status filter toolbar */}
      <div className="admin-orders-toolbar">
        <p className="admin-toolbar-meta">
          {filteredOrders.length} shown • {pendingCount} pending
        </p>
        <input
          className="orders-search-input"
          type="text"
          placeholder="Search by order id or customer"
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
        <p>Loading orders...</p>
      ) : (
      // Orders table/grid.
      <div className="orders-table">
        <div className="orders-head">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Current</span>
          <span>Status</span>
        </div>

        {filteredOrders.map((order) => (
          // One order row with status selector.
          <div key={order._id} className="orders-row">
            <span className="orders-id">#{order._id.slice(-8)}</span>
            <span>{order.user?.name || "Unknown"}</span>
            <span>{formatDateIN(order.createdAt)}</span>
            <span>{formatCurrencyINR(order.totalAmount)}</span>
            <span>
              <span className={`status-chip status-${order.orderStatus.toLowerCase()}`}>
                {order.orderStatus}
              </span>
            </span>

            <select
              className="orders-status-select"
              value={order.orderStatus}
              onChange={(e) =>
                handleStatusChange(order._id, e.target.value)
              }
            >
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        ))}

        {!filteredOrders.length && (
          <p className="admin-table-empty">
            No orders matched your search/filter.
          </p>
        )}
      </div>
      )}
    </section>
  );
}

export default AdminOrders;
