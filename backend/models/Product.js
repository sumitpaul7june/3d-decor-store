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

    stock: {
      type: Number,
      default: 0
    },

    type: {
      type: String,
      enum: ["physical"],
      default: "physical"
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published"
    },

    dimensions: {
      type: String
    },

    material: {
      type: String
    },

    careInstructions: {
      type: String
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    isBestseller: {
      type: Boolean,
      default: false
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

    coverImage: {
      type: String
    },

    averageRating: {
      type: Number,
      default: 0
    },

    numReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
