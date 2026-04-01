import HomeContent from "../models/HomeContent.js";

const DEFAULT_CTA_LINK = "/products";

const sanitizeHeroSlide = (slide = {}) => {
  const image = String(slide.image || slide.heroImage || "").trim();
  const title = String(slide.title || slide.heroTitle || "").trim();
  const subtitle = String(slide.subtitle || slide.heroSubtitle || "").trim();
  const ctaLabel = String(slide.ctaLabel || slide.heroCtaLabel || "").trim();
  const ctaLink = String(slide.ctaLink || slide.heroCtaLink || "").trim() || DEFAULT_CTA_LINK;

  return {
    image,
    title,
    subtitle,
    ctaLabel,
    ctaLink
  };
};

const normalizeHeroSlides = (heroSlides = [], legacyPayload = {}) => {
  const normalizedSlides = Array.isArray(heroSlides)
    ? heroSlides
        .map((slide) => sanitizeHeroSlide(slide))
        .filter((slide) => slide.image)
        .slice(0, 3)
    : [];

  if (normalizedSlides.length > 0) {
    return normalizedSlides;
  }

  const legacySlide = sanitizeHeroSlide({
    heroImage: legacyPayload.heroImage,
    heroTitle: legacyPayload.heroTitle,
    heroSubtitle: legacyPayload.heroSubtitle,
    heroCtaLabel: legacyPayload.heroCtaLabel,
    heroCtaLink: legacyPayload.heroCtaLink
  });

  return legacySlide.image ? [legacySlide] : [];
};

const sanitizeHomeContentPayload = (payload = {}) => {
  const heroSlides = normalizeHeroSlides(payload.heroSlides, payload);

  return {
    key: "home",
    heroSlides,
    // Clear legacy single-banner fields once the new carousel format saves.
    heroImage: "",
    heroTitle: "",
    heroSubtitle: "",
    heroCtaLabel: "",
    heroCtaLink: DEFAULT_CTA_LINK
  };
};

const normalizeHomeContentResponse = (content) => {
  if (!content) {
    return {
      key: "home",
      heroSlides: []
    };
  }

  const plainContent = content.toObject ? content.toObject() : content;

  return {
    ...plainContent,
    heroSlides: normalizeHeroSlides(plainContent.heroSlides, plainContent)
  };
};

export const getHomeContent = async (_req, res) => {
  try {
    const content = await HomeContent.findOne({ key: "home" });
    res.json(normalizeHomeContentResponse(content));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const upsertHomeContent = async (req, res) => {
  try {
    const payload = sanitizeHomeContentPayload(req.body);

    if (!payload.heroSlides.length) {
      return res.status(400).json({ message: "Add at least 1 homepage hero banner" });
    }

    const content = await HomeContent.findOneAndUpdate(
      { key: "home" },
      payload,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.json(normalizeHomeContentResponse(content));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
