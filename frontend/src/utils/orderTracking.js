export const buildOrderTimeline = (order = {}) => {
  const timeline = Array.isArray(order.statusTimeline) ? [...order.statusTimeline] : [];

  if (timeline.length > 0) {
    return timeline
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .map((entry) => ({
        title: entry.label || entry.status || "Update",
        meta: entry.note || "",
        createdAt: entry.createdAt || "",
        state: "complete",
      }));
  }

  const fallback = [
    {
      title: "Order placed",
      meta: "We’ve received your order.",
      createdAt: order.createdAt,
      state: "complete",
    },
  ];

  if (order.paymentStatus === "Paid") {
    fallback.push({
      title: "Payment confirmed",
      meta: "Your payment was successfully verified.",
      createdAt: order.updatedAt || order.createdAt,
      state: "complete",
    });
  }

  if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
    fallback.push({
      title: "Order shipped",
      meta: "Your package is on the way.",
      createdAt: order.updatedAt || order.createdAt,
      state: "complete",
    });
  }

  if (order.orderStatus === "Delivered") {
    fallback.push({
      title: "Delivered",
      meta: "Your order has been delivered.",
      createdAt: order.updatedAt || order.createdAt,
      state: "complete",
    });
  }

  if (order.orderStatus === "Cancelled") {
    fallback.push({
      title: "Cancelled",
      meta: "This order was cancelled.",
      createdAt: order.updatedAt || order.createdAt,
      state: "inactive",
    });
  }

  return fallback;
};
