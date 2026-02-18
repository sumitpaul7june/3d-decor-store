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
          enum: ["stl", "physical"],
          required: true
        },

        quantity: {
          type: Number,
          default: 1
        },

        price: {
          type: Number,
          required: true
        },

        // Snapshot of STL download metadata at purchase time.
        // This keeps customer downloads stable even if product changes later.
        stlFile: {
          type: String
        },

        stlFilePublicId: {
          type: String
        },

        stlFileOriginalName: {
          type: String
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
