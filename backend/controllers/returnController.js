import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";

/* ------------------ USER: CREATE RETURN ------------------ */

export const createReturn = async (req, res) => {
  try {
    const { orderId, items, reason, customerNote, evidenceImages } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ message: "Can only return delivered orders" });
    }

    // Check if an active return already exists for this order to prevent duplicates.
    // In a more complex system you could allow partial returns recursively.
    const existingReturn = await ReturnRequest.findOne({ order: orderId });
    if (existingReturn && !["Rejected", "Refunded"].includes(existingReturn.status)) {
      return res.status(400).json({ message: "An active return request already exists for this order" });
    }

    const newReturn = await ReturnRequest.create({
      order: orderId,
      user: req.user._id,
      items: items || [],
      reason,
      customerNote: customerNote || "",
      evidenceImages: evidenceImages || [],
      status: "Requested"
    });

    res.status(201).json({
      message: "Return request submitted successfully",
      returnRequest: newReturn
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ USER: GET MY RETURNS ------------------ */

export const getMyReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user._id })
      .populate("order", "totalAmount orderStatus _id")
      .populate("items.product", "name coverImage")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ GET RETURN BY ORDER ID ------------------ */

export const getReturnByOrder = async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findOne({ order: req.params.orderId })
      .populate("order", "totalAmount orderStatus _id")
      .populate("items.product", "name coverImage price");

    if (!returnReq) {
      return res.status(404).json({ message: "No return found for this order" });
    }

    // Simple security: only the owner or an admin can access this return.
    if (
      returnReq.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(returnReq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: GET ALL RETURNS ------------------ */

export const getAllReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({})
      .populate("user", "name email")
      .populate("order", "_id totalAmount")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: UPDATE RETURN STATUS ------------------ */

export const updateReturnStatus = async (req, res) => {
  try {
    const { status, refundAmount } = req.body;

    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ message: "Return request not found" });
    }

    const validStatuses = ["Requested", "Approved", "Rejected", "Picked Up", "Refunded"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status) returnReq.status = status;
    if (refundAmount !== undefined) returnReq.refundAmount = Number(refundAmount);

    await returnReq.save();

    res.json({ message: "Return request updated successfully", returnRequest: returnReq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------ ADMIN: UPDATE INTERNAL NOTE ------------------ */

export const updateReturnNote = async (req, res) => {
  try {
    const { adminNote } = req.body;

    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq) {
      return res.status(404).json({ message: "Return request not found" });
    }

    returnReq.adminNote = adminNote || "";
    await returnReq.save();

    res.json({ message: "Admin note updated", returnRequest: returnReq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
