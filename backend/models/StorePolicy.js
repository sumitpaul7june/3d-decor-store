import mongoose from "mongoose";

const storePolicySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "store-policies",
      unique: true,
      trim: true
    },

    shippingInfo: {
      type: String,
      default: "",
      trim: true
    },

    returnPolicy: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("StorePolicy", storePolicySchema);
