import mongoose from "mongoose";

const homeHeroSlideSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    ctaLabel: { type: String, default: "", trim: true },
    ctaLink: { type: String, default: "/products", trim: true }
  },
  { _id: false }
);

const featuredCategorySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String },
    link: { type: String }
  },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, trim: true },
    author: { type: String, trim: true },
    role: { type: String, trim: true }
  },
  { _id: false }
);

const homeContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "home",
      unique: true,
      trim: true
    },
    heroSlides: {
      type: [homeHeroSlideSchema],
      default: []
    },
    featuredCategories: {
      type: [featuredCategorySchema],
      default: []
    },
    featuredProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],
    testimonials: {
      type: [testimonialSchema],
      default: []
    },
    promoStrip: {
      text: { type: String, default: "" },
      link: { type: String, default: "" },
      active: { type: Boolean, default: false }
    },
    sectionOrder: {
      type: [String],
      default: ["hero", "promo", "categories", "products", "testimonials"]
    },
    visibilityFlags: {
      hero: { type: Boolean, default: true },
      promo: { type: Boolean, default: true },
      categories: { type: Boolean, default: true },
      products: { type: Boolean, default: true },
      testimonials: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model("HomeContent", homeContentSchema);
