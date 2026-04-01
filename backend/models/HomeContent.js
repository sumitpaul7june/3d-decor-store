import mongoose from "mongoose";

const homeHeroSlideSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: "",
      trim: true
    },
    subtitle: {
      type: String,
      default: "",
      trim: true
    },
    ctaLabel: {
      type: String,
      default: "",
      trim: true
    },
    ctaLink: {
      type: String,
      default: "/products",
      trim: true
    }
  },
  { _id: false }
);

const homeContentSchema = new mongoose.Schema(
  {
    // Singleton key keeps one editable homepage content record.
    key: {
      type: String,
      default: "home",
      unique: true,
      trim: true
    },

    // Wide hero banner shown on the storefront home page.
    heroImage: {
      type: String,
      default: ""
    },

    // Hero text fields stay optional so the admin can save visuals first.
    heroTitle: {
      type: String,
      default: "",
      trim: true
    },

    heroSubtitle: {
      type: String,
      default: "",
      trim: true
    },

    heroCtaLabel: {
      type: String,
      default: "",
      trim: true
    },

    heroCtaLink: {
      type: String,
      default: "/products",
      trim: true
    },

    // New structured homepage carousel content.
    heroSlides: {
      type: [homeHeroSlideSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 3;
        },
        message: "Home page can have up to 3 hero slides"
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("HomeContent", homeContentSchema);
