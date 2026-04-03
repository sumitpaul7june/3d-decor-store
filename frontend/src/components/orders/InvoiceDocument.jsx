import { formatCurrencyINR, formatDateIN } from "../../utils/formatters";
import "./InvoiceDocument.css";

function InvoiceDocument({ order, title = "Invoice", subtitle = "QALARAHI" }) {
  if (!order) {
    return null;
  }

  const address = order.addressSnapshot || {};

  return (
    <article className="invoice-document">
      <header className="invoice-document__head">
        <div>
          <p className="invoice-document__brand">{subtitle}</p>
          <h1>{title}</h1>
          <p className="invoice-document__meta">
            Order #{order._id?.slice(-8)} • {formatDateIN(order.createdAt)}
          </p>
        </div>

        <div className="invoice-document__status">
          <span>{order.orderStatus}</span>
          <span>{order.paymentStatus}</span>
        </div>
      </header>

      <section className="invoice-document__grid">
        <div>
          <p className="invoice-document__label">Billing / Shipping</p>
          <h2>{address.fullName || "Customer"}</h2>
          <p>{address.addressLine || "-"}</p>
          <p>
            {[address.city, address.state, address.pincode].filter(Boolean).join(", ") || "-"}
          </p>
          <p>{address.country || "-"}</p>
          <p>{address.phone || "-"}</p>
        </div>

        <div>
          <p className="invoice-document__label">Payment</p>
          <h2>{order.paymentStatus || "Pending"}</h2>
          <p>Transaction: {order.payment?.paymentId || "Not available"}</p>
          <p>Gateway Order: {order.payment?.orderId || "Not available"}</p>
          <p>Method: {order.payment?.method || "Not available"}</p>
        </div>
      </section>

      <section className="invoice-document__table">
        <div className="invoice-document__table-head">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>

        {(order.items || []).map((item, index) => (
          <div
            key={`${order._id}-${item.product?._id || item.name}-${index}`}
            className="invoice-document__row"
          >
            <span>{item.name || "Product"}</span>
            <span>{item.quantity}</span>
            <span>{formatCurrencyINR(item.price)}</span>
            <strong>{formatCurrencyINR((item.price || 0) * (item.quantity || 0))}</strong>
          </div>
        ))}
      </section>

      <footer className="invoice-document__footer">
        <div>
          <p className="invoice-document__label">Note</p>
          <p>This invoice reflects the latest status of your QALARAHI order.</p>
        </div>

        <div className="invoice-document__total">
          <p>Total</p>
          <strong>{formatCurrencyINR(order.totalAmount)}</strong>
        </div>
      </footer>
    </article>
  );
}

export default InvoiceDocument;
