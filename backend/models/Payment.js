import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    appOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderId: String,
    paymentId: String,
    receipt: String,
    method: String,
    contact: String,
    email: String,
    failureReason: String,
    failureCode: String,
    lastAttemptedAt: Date,
    verifiedAt: Date,

    amount: Number,

    status: {
        type: String,
        enum: ["created", "success", "failed"],
        default: "created"
    },

    productName: String,
    address: String

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
