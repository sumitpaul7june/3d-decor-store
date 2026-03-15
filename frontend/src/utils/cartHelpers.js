// Shared cart helpers to keep cart shape consistent across components.
// Converts backend cart response -> frontend Redux cart item shape.
export const normalizeServerCart = (serverCart = []) =>
  serverCart.map((item) => ({
    id: item.product?._id,
    name: item.product?.name,
    price: Number(item.product?.price || 0),
    originalPrice: Number(item.product?.originalPrice || item.product?.price || 0),
    type: item.product?.type || "physical",
    image: item.product?.images?.[0] || "",
    qty: Number(item.quantity || 1),
  }));

// Converts product response -> single cart item shape for guest cart flow.
export const buildCartItemFromProduct = (product) => ({
  id: product._id || product.id,
  name: product.name,
  price: Number(product.price || 0),
  originalPrice: Number(product.originalPrice || product.price || 0),
  type: product.type || "physical",
  image: product.image || product.images?.[0] || "",
});
