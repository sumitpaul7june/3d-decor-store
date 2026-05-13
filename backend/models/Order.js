import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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

        name: {
          type: String
        },

        type: {
          type: String,
          enum: ["physical"],
          default: "physical"
        },

        quantity: {
          type: Number,
          default: 1
        },

        price: {
          type: Number,
          required: true
        }
      }
    ],

    addressSnapshot: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },

    trackingLink: {
      type: String,
      default: ""
    },

    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Processed"],
      default: "None"
    },

    adminNote: {
      type: String,
      default: ""
    },

    statusTimeline: [
      {
        status: {
          type: String,
          default: ""
        },
        label: {
          type: String,
          default: ""
        },
        note: {
          type: String,
          default: ""
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
