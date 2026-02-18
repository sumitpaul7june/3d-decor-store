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
      enum: ["stl", "physical"],
      required: true
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
    },

    stlFile: {
      type: String,
      validate: {
        validator: function (value) {
          if (this.type === "stl") {
            return !!value;
          }
          return true;
        },
        message: "STL file required for STL products"
      }
    },

    stlFilePublicId: {
      type: String
    },

    stlFileOriginalName: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
