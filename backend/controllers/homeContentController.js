import HomeContent from "../models/HomeContent.js";

const DEFAULT_CTA_LINK = "/products";

const sanitizeHeroSlide = (slide = {}) => ({
  image: String(slide.image || "").trim(),
  title: String(slide.title || "").trim(),
  subtitle: String(slide.subtitle || "").trim(),
  ctaLabel: String(slide.ctaLabel || "").trim(),
  ctaLink: String(slide.ctaLink || "").trim() || DEFAULT_CTA_LINK,
});

export const getHomeContent = async (_req, res) => {
  try {
    let content = await HomeContent.findOne({ key: "home" }).populate("featuredProducts", "name price originalPrice coverImage category");
    
    if (!content) {
      content = new HomeContent({ key: "home" });
    }
    
    res.json(content);
  } catch (error) {
    console.error("GET HOME ERROR", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const upsertHomeContent = async (req, res) => {
  try {
    const {
      heroSlides,
      featuredCategories,
      featuredProducts,
      testimonials,
      promoStrip,
      sectionOrder,
      visibilityFlags
    } = req.body;

    const cleanSlides = Array.isArray(heroSlides)
      ? heroSlides.map(sanitizeHeroSlide).filter(s => s.image)
      : [];

    const payload = {
      heroSlides: cleanSlides,
      featuredCategories: Array.isArray(featuredCategories) ? featuredCategories : [],
      featuredProducts: Array.isArray(featuredProducts) ? featuredProducts : [],
      testimonials: Array.isArray(testimonials) ? testimonials : [],
      promoStrip: promoStrip || { text: "", link: "", active: false },
      sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : ["hero", "promo", "categories", "products", "testimonials"],
      visibilityFlags: visibilityFlags || {
        hero: true, promo: true, categories: true, products: true, testimonials: true
      }
    };

    const content = await HomeContent.findOneAndUpdate(
      { key: "home" },
      payload,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate("featuredProducts", "name price originalPrice coverImage category");

    res.json(content);
  } catch (error) {
    console.error("UPSERT HOME ERROR", error);
    res.status(500).json({ message: "Server Error" });
  }
};
