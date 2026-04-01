import StorePolicy from "../models/StorePolicy.js";

const DEFAULT_SHIPPING_INFO = [
  "Ships within 3-5 business days with secure packaging for premium decor pieces.",
  "- Delivery available across India",
  "- Transit-safe packaging included",
  "- Delivery updates shared once your order is dispatched"
].join("\n");

const DEFAULT_RETURN_POLICY = [
  "Returns are accepted within 7 days for unused pieces in original condition.",
  "- Replacement support is available for transit damage",
  "- Custom or final-sale pieces can be marked non-returnable",
  "- Reach our concierge team for return assistance"
].join("\n");

const normalizeStorePolicy = (content) => {
  if (!content) {
    return {
      key: "store-policies",
      shippingInfo: DEFAULT_SHIPPING_INFO,
      returnPolicy: DEFAULT_RETURN_POLICY
    };
  }

  const plainContent = content.toObject ? content.toObject() : content;

  return {
    ...plainContent,
    shippingInfo: String(plainContent.shippingInfo || "").trim() || DEFAULT_SHIPPING_INFO,
    returnPolicy: String(plainContent.returnPolicy || "").trim() || DEFAULT_RETURN_POLICY
  };
};

const sanitizePolicyPayload = (payload = {}) => ({
  key: "store-policies",
  shippingInfo: String(payload.shippingInfo || "").trim(),
  returnPolicy: String(payload.returnPolicy || "").trim()
});

export const getStorePolicies = async (_req, res) => {
  try {
    const content = await StorePolicy.findOne({ key: "store-policies" });
    res.json(normalizeStorePolicy(content));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const upsertStorePolicies = async (req, res) => {
  try {
    const payload = sanitizePolicyPayload(req.body);

    if (!payload.shippingInfo) {
      return res.status(400).json({ message: "Shipping information is required" });
    }

    if (!payload.returnPolicy) {
      return res.status(400).json({ message: "Return policy is required" });
    }

    const content = await StorePolicy.findOneAndUpdate(
      { key: "store-policies" },
      payload,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.json(normalizeStorePolicy(content));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
