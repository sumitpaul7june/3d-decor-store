// Admin orders list with inline status updates (mock state).
import { useState } from "react";
import "./AdminOrders.css";

const initialOrders = [
  {
    id: 101,
    customer: "Rahul Sharma",
    total: 1299,
    status: "Pending",
  },
  {
    id: 102,
    customer: "Aditi Verma",
    total: 299,
    status: "Shipped",
  },
];

function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = (id, newStatus) => {
    // Update order status in local state.
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  return (
    <section className="admin-orders">
      <h1 className="admin-orders-title">Orders</h1>

      <div className="orders-table">
        <div className="orders-head">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {orders.map((order) => (
          <div key={order.id} className="orders-row">
            <span>#{order.id}</span>
            <span>{order.customer}</span>
            <span>₹{order.total}</span>

            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(order.id, e.target.value)
              }
            >
              <option>Pending</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminOrders;
