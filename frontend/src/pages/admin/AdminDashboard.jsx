// Admin dashboard page: KPI cards, recent orders, and quick operational insights.
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import "./AdminDashboard.css";


function AdminDashboard() {
    // Dashboard metrics and page states.
    const [stats, setStats] = useState({
      totalOrders: 0,
      products: 0,
      users: 0,
      loggedInUsers: 0,
      revenue: 0,
      pending: 0,
      paidOrders: 0,
      avgOrderValue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      // Fetch dashboard numbers from orders + products endpoints.
      const fetchStats = async () => {
        try {
          setLoading(true);
          setError("");
          const [ordersRes, productsRes, usersRes] = await Promise.all([
            axios.get("/orders"),
            axios.get("/products/admin/all"),
            axios.get("/users/admin/all")
          ]);

          const orders = ordersRes.data || [];
          const products = productsRes.data || [];
          const users = usersRes.data || [];
          const nonCancelledOrders = orders.filter(
            (order) => order.orderStatus !== "Cancelled"
          );
          const revenue = nonCancelledOrders
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          const pending = orders.filter(
            (order) => order.orderStatus === "Pending"
          ).length;
          const paidOrders = orders.filter(
            (order) => order.paymentStatus === "Paid"
          ).length;
          const avgOrderValue = nonCancelledOrders.length
            ? Math.round(revenue / nonCancelledOrders.length)
            : 0;
          const sortedRecent = [...orders].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          // Save computed dashboard stats.
          setStats({
            totalOrders: orders.length,
            products: products.length,
            users: users.length,
            loggedInUsers: users.filter((user) => Number(user.loginCount || 0) > 0).length,
            revenue,
            pending,
            paidOrders,
            avgOrderValue
          });
          setRecentOrders(sortedRecent.slice(0, 5));
        } catch (error) {
          setError("Failed to load dashboard data");
          setStats({
            totalOrders: 0,
            products: 0,
            users: 0,
            loggedInUsers: 0,
            revenue: 0,
            pending: 0,
            paidOrders: 0,
            avgOrderValue: 0
          });
          setRecentOrders([]);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, []);

    const metricCards = [
      { label: "Total Orders", value: stats.totalOrders, tone: "neutral" },
      { label: "Revenue", value: formatCurrencyINR(stats.revenue), tone: "revenue" },
      { label: "Pending Orders", value: stats.pending, tone: "warning" },
      { label: "Products", value: stats.products, tone: "neutral" },
      { label: "Users", value: stats.users, tone: "neutral" },
      { label: "Logged In Users", value: stats.loggedInUsers, tone: "info" },
      { label: "Avg. Order Value", value: formatCurrencyINR(stats.avgOrderValue), tone: "info" }
    ];

    return (
      <section className="dashboard">
        {/* Dashboard header + refresh action */}
        <div className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Overview</p>
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <button
            className="dashboard-refresh-btn"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        {error && <p className="dashboard-error">{error}</p>}
  
        {/* KPI cards */}
        <div className="dashboard-cards">
          {metricCards.map((card) => (
            <article key={card.label} className={`dashboard-card tone-${card.tone}`}>
              <p className="card-label">{card.label}</p>
              <h2 className="card-value">{loading ? "..." : card.value}</h2>
            </article>
          ))}
        </div>

        {/* Two-column dashboard panels */}
        <div className="dashboard-layout">
          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">Recent Orders</h2>
              <span className="dashboard-panel-meta">Last 5</span>
            </div>

            {loading ? (
              <p className="panel-empty">Loading recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="panel-empty">No recent orders.</p>
            ) : (
              <div className="dashboard-order-list">
                {/* Recent order rows */}
                {recentOrders.map((order) => (
                  <div key={order._id} className="dashboard-order-row">
                    <div className="order-primary">
                      <span className="order-id">#{order._id.slice(-8)}</span>
                      <span className="order-customer">
                        {order.user?.name || "Unknown"}
                      </span>
                    </div>
                    <div className="order-secondary">
                      <span className="order-date">{formatDateIN(order.createdAt)}</span>
                      <span className="order-total">{formatCurrencyINR(order.totalAmount)}</span>
                      <span className={`order-status status-${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">Operations Snapshot</h2>
            </div>

            {/* Quick operational insights */}
            <div className="dashboard-insights">
              <div className="insight-row">
                <span>Paid orders</span>
                <strong>{loading ? "..." : stats.paidOrders}</strong>
              </div>
              <div className="insight-row">
                <span>Unpaid orders</span>
                <strong>{loading ? "..." : Math.max(stats.totalOrders - stats.paidOrders, 0)}</strong>
              </div>
              <div className="insight-row">
                <span>Pending fulfilment</span>
                <strong>{loading ? "..." : stats.pending}</strong>
              </div>
              <div className="insight-row">
                <span>Catalog size</span>
                <strong>{loading ? "..." : stats.products}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }
  
  export default AdminDashboard;
  
