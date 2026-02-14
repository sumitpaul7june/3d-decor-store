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
      required: true
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
