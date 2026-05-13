import { useState } from "react";
import axios from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./AdminDashboard.css";

// Shared chart tooltip — renders identically for both revenue and AOV charts.
function ChartTooltip({ active, payload, label, subLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-val">{formatCurrencyINR(payload[0].value)}</p>
      <p className="chart-tooltip-sub">
        {subLabel ?? `${payload[0].payload.orders} orders`}
      </p>
    </div>
  );
}

const EMPTY_DASHBOARD = {
  kpis: { totalRevenue: 0, ordersCount: 0, usersCount: 0, productsCount: 0, pendingReturns: 0 },
  salesData: [],
  recentOrders: [],
  recentReturns: [],
  recentCustomers: [],
  topProducts: [],
};

function AdminDashboard() {
  // useFetch handles loading / error state and initial load.
  const { data: fetchedData, loading, error, reload } = useFetch(async () => {
    const response = await axios.get("/analytics/dashboard");
    return response.data;
  });

  // Merge fetched data with safe defaults so the rest of the template never
  // has to guard against null.
  const data = fetchedData ?? EMPTY_DASHBOARD;

  const kpis = data.kpis || {};
  const metricCards = [
    { label: "Total Revenue", value: formatCurrencyINR(kpis.totalRevenue || 0), tone: "revenue" },
    { label: "Total Orders", value: kpis.ordersCount || 0, tone: "neutral" },
    { label: "Pending Returns", value: kpis.pendingReturns || 0, tone: "warning" },
    { label: "Users", value: kpis.usersCount || 0, tone: "info" },
    { label: "Products", value: kpis.productsCount || 0, tone: "neutral" }
  ];

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Overview</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <button
          className="dashboard-refresh-btn"
          onClick={reload}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="dashboard-cards">
        {metricCards.map((card) => (
          <article key={card.label} className={`dashboard-card tone-${card.tone}`}>
            <p className="card-label">{card.label}</p>
            <h2 className="card-value">{loading ? "..." : card.value}</h2>
          </article>
        ))}
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="dashboard-charts-layout">
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2 className="dashboard-panel-title">Sales Pipeline (7 Days)</h2>
          </div>
          <div className="chart-container">
            {loading ? (
              <p className="panel-empty center-msg">Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b88f4b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#b88f4b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2efea" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8678" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8678" }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#b88f4b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2 className="dashboard-panel-title">Average Order Value</h2>
          </div>
          <div className="chart-container">
            {loading ? (
              <p className="panel-empty center-msg">Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesData}>
                  <defs>
                    <linearGradient id="colorAov" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2efea" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8678" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8d8678" }} tickFormatter={(val) => `₹${val}`} width={55} />
                  <Tooltip content={<ChartTooltip subLabel="AOV" />} />
                  <Area type="monotone" dataKey="aov" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorAov)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </div>

      {/* --- THREE COLUMN LAYOUT --- */}
      <div className="dashboard-triple-layout">

        {/* COL 1: Recent Orders */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2 className="dashboard-panel-title">Recent Orders</h2>
          </div>
          {loading ? (
            <p className="panel-empty">Loading...</p>
          ) : data.recentOrders?.length === 0 ? (
            <p className="panel-empty">No orders yet.</p>
          ) : (
            <div className="dashboard-feed">
              {data.recentOrders.map((order) => (
                <div key={order._id} className="feed-row order-row">
                  <div className="feed-primary">
                    <span>#{order._id.slice(-8)}</span>
                    <strong>{formatCurrencyINR(order.totalAmount)}</strong>
                  </div>
                  <div className="feed-secondary">
                    <span>{order.user?.name || "Guest"}</span>
                    <span className={`status status-${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* COL 2: Top Products */}
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2 className="dashboard-panel-title">Top Products</h2>
          </div>
          {loading ? (
            <p className="panel-empty">Loading...</p>
          ) : data.topProducts?.length === 0 ? (
            <p className="panel-empty">No sales data.</p>
          ) : (
            <div className="dashboard-feed list-feed">
              {data.topProducts.map((prod, i) => (
                <div key={prod._id} className="feed-row product-row">
                  <span className="product-rank">{i + 1}</span>
                  {prod.image && <img src={prod.image} alt="" className="product-thumb" />}
                  <div className="product-info">
                    <span className="product-name">{prod.name}</span>
                    <span className="product-sold">{prod.sold} sold ({formatCurrencyINR(prod.revenue)})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* COL 3: Action Center */}
        <article className="dashboard-panel no-pad-bottom">
          <div className="dashboard-panel-head">
            <h2 className="dashboard-panel-title">Action Center</h2>
          </div>

          <div className="action-center-group">
            <h3 className="sub-kicker">Pending Returns</h3>
            {loading ? <p className="panel-empty">Loading...</p> : null}
            {!loading && data.recentReturns?.length === 0 ? (
               <p className="panel-empty text-success">All caught up.</p>
            ) : (
               <div className="dashboard-feed compact-feed">
                  {data.recentReturns?.map(req => (
                     <a href="/admin/returns" key={req._id} className="feed-row action-row">
                       <div className="action-info">
                         <span><strong>RMA:</strong> {req.order?._id?.slice(-8) || "N/A"}</span>
                         <small>{req.user?.name || "Customer"} requested return</small>
                       </div>
                       <span className="arr">→</span>
                     </a>
                  ))}
               </div>
            )}
          </div>

          <div className="action-center-group mt-lg">
            <h3 className="sub-kicker">Latest Signups</h3>
            {!loading && data.recentCustomers?.length === 0 ? (
               <p className="panel-empty">No signups yet.</p>
            ) : (
               <div className="dashboard-feed compact-feed">
                  {data.recentCustomers?.map(user => (
                     <div key={user._id} className="feed-row signup-row">
                       <span className="signup-avatar">{user.name.charAt(0)}</span>
                       <div className="signup-info">
                         <strong>{user.name}</strong>
                         <span>{formatDateIN(user.createdAt)}</span>
                       </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        </article>

      </div>
    </section>
  );
}

export default AdminDashboard;
