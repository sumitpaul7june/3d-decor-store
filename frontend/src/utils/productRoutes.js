const PRODUCT_ID_PATTERN = /([a-f0-9]{24})$/i;

export const slugifyProductName = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const buildProductPath = (product = {}) => {
  const productId = product._id || product.id || "";
  const productSlug = slugifyProductName(product.name || "product");

  if (!productId) {
    return `/products`;
  }

  return `/product/${productSlug || "product"}-${productId}`;
};

export const getProductIdFromRouteParam = (value = "") => {
  const routeParam = String(value || "").trim();

  if (!routeParam) {
    return "";
  }

  const matchedId = routeParam.match(PRODUCT_ID_PATTERN);

  if (matchedId?.[1]) {
    return matchedId[1];
  }

  return routeParam;
};
