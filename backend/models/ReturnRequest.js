import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
      }
    ],
    reason: {
      type: String,
      required: true
    },
    customerNote: {
      type: String,
      default: ""
    },
    adminNote: {
      type: String,
      default: ""
    },
    evidenceImages: {
      type: [String],
      default: []
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Requested", "Approved", "Rejected", "Picked Up", "Refunded"],
      default: "Requested"
    }
  },
  { timestamps: true }
);

export default mongoose.model("ReturnRequest", returnRequestSchema);
