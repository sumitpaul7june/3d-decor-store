import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    originalPrice: {
      type: Number,
      required: true
    },

    type: {
      type: String,
      enum: ["physical"],
      default: "physical"
    },

    category: {
      type: String,
      required: true
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0 && value.length <= 4;
        },
        message: "Product must have between 1 and 4 images"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
