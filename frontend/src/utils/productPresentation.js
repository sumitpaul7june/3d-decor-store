// Shared product presentation helpers to preview richer merchandising before final backend content is ready.
import { getShowcaseGallery, getShowcaseImage } from "../data/showcaseImages";

const previewProfiles = [
  {
    label: "Gallery Accent",
    collection: "Curated Collection",
    trustNote: "Style-led pick",
    description:
      "A refined decor piece chosen to bring depth, texture, and a more finished visual rhythm to shelves, consoles, and quiet corners.",
    detailPoints: [
      "Makes blank surfaces feel styled and intentional",
      "Works well in living rooms, foyers, and bedside setups",
      "Easy to pair with books, candles, and ceramic accents",
    ],
    finishes: [
      { name: "Gold", hex: "#c9961b" },
      { name: "Clay", hex: "#cb7e2f" },
      { name: "Ivory", hex: "#efe6d7" },
    ],
  },
  {
    label: "Statement Decor",
    collection: "Best Seller",
    trustNote: "High visual impact",
    description:
      "Designed for homes that want a stronger first impression, this statement accent adds character without making the space feel busy.",
    detailPoints: [
      "Creates a focal point without overwhelming the room",
      "Best suited for consoles, center tables, and styled nooks",
      "Pairs beautifully with wood, linen, and neutral palettes",
    ],
    finishes: [
      { name: "Gold", hex: "#d19b1f" },
      { name: "Bronze", hex: "#9a6735" },
      { name: "Stone", hex: "#e6dfd2" },
    ],
  },
  {
    label: "Modern Styling Piece",
    collection: "New Arrival",
    trustNote: "Premium finish",
    description:
      "A modern decor essential with a premium presence, ideal for layering into homes that feel minimal, warm, and thoughtfully collected.",
    detailPoints: [
      "Softens modern spaces with added texture and balance",
      "Looks elevated in curated shelf or coffee-table styling",
      "Brings a clean premium feel to everyday interiors",
    ],
    finishes: [
      { name: "Sand", hex: "#cfac6b" },
      { name: "Walnut", hex: "#8a5832" },
      { name: "Pearl", hex: "#f1ece2" },
    ],
  },
  {
    label: "Sculptural Edit",
    collection: "Limited Edit",
    trustNote: "Editor pick",
    description:
      "This sculptural accent is selected for its ability to instantly upgrade a room with form, presence, and gallery-inspired simplicity.",
    detailPoints: [
      "Adds height, shape, and movement to flat surfaces",
      "Ideal for modern Indian homes with clean styling",
      "Works across bedrooms, dining spaces, and entryways",
    ],
    finishes: [
      { name: "Ochre", hex: "#d8a20a" },
      { name: "Copper", hex: "#cb7e2f" },
      { name: "Linen", hex: "#f4ede1" },
    ],
  },
];

const keywordProfiles = [
  {
    keywords: ["wall", "frame", "panel", "art"],
    profile: {
      label: "Wall Statement",
      collection: "Wall Decor",
      trustNote: "Room-defining piece",
      description:
        "Created to anchor empty walls with a polished, premium feel, this decor piece gives living rooms and entryways a stronger visual identity.",
      detailPoints: [
        "Ideal above sofas, consoles, or entry benches",
        "Adds structure and presence to open wall space",
        "Best styled with warm lighting and muted textures",
      ],
      finishes: [
        { name: "Gold", hex: "#d29f18" },
        { name: "Bronze", hex: "#9a6735" },
        { name: "White", hex: "#f5f1e8" },
      ],
    },
  },
  {
    keywords: ["vase", "urn", "pot", "ceramic", "planter"],
    profile: {
      label: "Ceramic Accent",
      collection: "Shelf Styling",
      trustNote: "Shelf-ready piece",
      description:
        "A sculptural ceramic accent that instantly elevates shelf styling, coffee tables, and consoles with a calmer, gallery-like finish.",
      detailPoints: [
        "Looks premium on sideboards, shelves, and center tables",
        "Easy to pair with dried stems, books, or candles",
        "Adds warmth and shape without visual clutter",
      ],
      finishes: [
        { name: "Sand", hex: "#d8b57f" },
        { name: "Terracotta", hex: "#be7440" },
        { name: "Bone", hex: "#efe7d8" },
      ],
    },
  },
  {
    keywords: ["lamp", "light", "lantern"],
    profile: {
      label: "Lighting Accent",
      collection: "Soft Glow Edit",
      trustNote: "Ambient styling",
      description:
        "Chosen for homes that want more mood and softness, this lighting-focused decor accent helps build a warm, premium atmosphere.",
      detailPoints: [
        "Ideal for bedside tables, reading corners, and consoles",
        "Supports a warm, layered lighting setup",
        "Balances sculptural form with everyday usability",
      ],
      finishes: [
        { name: "Amber", hex: "#c68c26" },
        { name: "Bronze", hex: "#8f613a" },
        { name: "Opal", hex: "#f1ede5" },
      ],
    },
  },
  {
    keywords: ["bowl", "tray", "plate"],
    profile: {
      label: "Tabletop Accent",
      collection: "Hosting Edit",
      trustNote: "Table-ready piece",
      description:
        "A tabletop styling piece that makes dining setups, consoles, and coffee tables feel more polished, composed, and premium.",
      detailPoints: [
        "Perfect for coffee-table styling and entry consoles",
        "Adds depth to layered hosting or decor arrangements",
        "Feels elevated with candles, books, or dried florals",
      ],
      finishes: [
        { name: "Gold", hex: "#d19b1f" },
        { name: "Terracotta", hex: "#cb7e2f" },
        { name: "Shell", hex: "#f4ead7" },
      ],
    },
  },
];

const getHash = (seed = 0) =>
  String(seed)
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

const formatLabel = (value = "") =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const hasValidImage = (value = "") => {
  const image = String(value).trim().toLowerCase();
  return Boolean(image) && !image.includes("table_lamp") && !image.includes("placeholder");
};

const hasRichDescription = (value = "") => String(value).trim().length > 40;

const truncateText = (value = "", limit = 125) => {
  const clean = String(value).trim();

  if (clean.length <= limit) {
    return clean;
  }

  return `${clean.slice(0, limit).trimEnd()}...`;
};

const pickProfile = (product = {}, seed = 0) => {
  const searchableText = `${product.name || ""} ${product.category || ""}`.toLowerCase();
  const keywordMatch = keywordProfiles.find(({ keywords }) =>
    keywords.some((keyword) => searchableText.includes(keyword))
  );

  if (keywordMatch) {
    return keywordMatch.profile;
  }

  return previewProfiles[getHash(seed) % previewProfiles.length];
};

export const getProductPresentation = (product = {}) => {
  const seed = product._id || product.id || product.name || 0;
  const profile = pickProfile(product, seed);
  const rawImages = Array.isArray(product.images) ? product.images.filter(hasValidImage) : [];
  const coverImage = hasValidImage(product.coverImage)
    ? product.coverImage
    : hasValidImage(product.image)
      ? product.image
      : rawImages[0] || getShowcaseImage(seed);
  const gallery = rawImages.length > 0 ? rawImages : getShowcaseGallery(seed, 3);
  const description = hasRichDescription(product.description)
    ? product.description.trim()
    : profile.description;

  return {
    featuredImage: coverImage,
    coverImage,
    gallery,
    description,
    shortDescription: truncateText(description),
    categoryLabel: formatLabel(product.category || profile.label),
    collectionLabel: profile.collection,
    trustNote: profile.trustNote,
    detailPoints: profile.detailPoints,
    finishes: profile.finishes || [
      { name: "Gold", hex: "#d19b1f" },
      { name: "Bronze", hex: "#9a6735" },
      { name: "White", hex: "#f4ede1" },
    ],
    styleOptions:
      product.type === "digital"
        ? ["Single file", "Bundle pack"]
        : ["Unframed", "Framed"],
    offer: {
      code: "DECOR10",
      title: "Extra savings on curated picks",
      text: "Enjoy 10% extra discount on premium decor orders above ₹5,000 with code DECOR10.",
    },
  };
};
