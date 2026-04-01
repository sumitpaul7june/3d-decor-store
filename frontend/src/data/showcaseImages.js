// Temporary stock imagery used to preview premium storefront layouts.
export const showcaseImages = [
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
];

const getShowcaseIndex = (seed = 0) => {
  const value = String(seed);
  const hash = value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return hash % showcaseImages.length;
};

export const getShowcaseImage = (seed = 0) => showcaseImages[getShowcaseIndex(seed)];

export const getShowcaseGallery = (seed = 0, count = 3) =>
  Array.from({ length: count }, (_, index) => {
    const imageIndex = (getShowcaseIndex(seed) + index) % showcaseImages.length;
    return showcaseImages[imageIndex];
  });
