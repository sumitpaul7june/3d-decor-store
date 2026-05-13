import { sendEmail } from "./mailer.js";

const formatCurrencyINR = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const buildOrderLink = (orderId) => {
  const frontendUrl = (process.env.FRONTEND_URL || "").trim();

  if (!frontendUrl || !orderId) {
    return "";
  }

  return `${frontendUrl}/orders/my/${orderId}`;
};

export const sendOrderPlacedEmail = async ({ user, order }) => {
  if (!user?.email || !order?._id) {
    return;
  }

  const orderLink = buildOrderLink(order._id);

  await sendEmail({
    to: user.email,
    subject: `QALARAHI order placed • #${String(order._id).slice(-8)}`,
    html: `
      <p>Hello ${user.name || "there"},</p>
      <p>Your order <strong>#${String(order._id).slice(-8)}</strong> has been placed successfully.</p>
      <p>Total: <strong>${formatCurrencyINR(order.totalAmount)}</strong></p>
      ${
        orderLink
          ? `<p>You can review your order here: <a href="${orderLink}">${orderLink}</a></p>`
          : ""
      }
      <p>We will share updates as your order moves forward.</p>
    `,
  });
};

export const sendPaymentSuccessEmail = async ({ user, order }) => {
  if (!user?.email || !order?._id) {
    return;
  }

  const orderLink = buildOrderLink(order._id);

  await sendEmail({
    to: user.email,
    subject: `Payment confirmed • Order #${String(order._id).slice(-8)}`,
    html: `
      <p>Hello ${user.name || "there"},</p>
      <p>Your payment for order <strong>#${String(order._id).slice(-8)}</strong> was received successfully.</p>
      <p>Total paid: <strong>${formatCurrencyINR(order.totalAmount)}</strong></p>
      ${
        orderLink
          ? `<p>You can track your order here: <a href="${orderLink}">${orderLink}</a></p>`
          : ""
      }
      <p>Thank you for shopping with QALARAHI.</p>
    `,
  });
};

export const sendOrderStatusEmail = async ({ user, order }) => {
  if (!user?.email || !order?._id) {
    return;
  }

  const orderLink = buildOrderLink(order._id);

  await sendEmail({
    to: user.email,
    subject: `Order update • #${String(order._id).slice(-8)} is ${order.orderStatus}`,
    html: `
      <p>Hello ${user.name || "there"},</p>
      <p>Your order <strong>#${String(order._id).slice(-8)}</strong> is now <strong>${order.orderStatus}</strong>.</p>
      ${
        orderLink
          ? `<p>Track the latest updates here: <a href="${orderLink}">${orderLink}</a></p>`
          : ""
      }
      <p>If you need help, please reply to this email or contact support.</p>
    `,
  });
};
