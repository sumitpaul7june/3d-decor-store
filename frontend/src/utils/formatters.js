// Shared formatter helpers used across pages to avoid repeating date/currency logic.

// Format a number as Indian Rupees without decimal points.
export const formatCurrencyINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Format an ISO date into a short, readable India-local format.
export const formatDateIN = (isoDate) => {
  // Return fallback when value is missing.
  if (!isoDate) return "-";
  // Keep a consistent short date format across the app.
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
