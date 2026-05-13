import Product from "../models/Product.js";

const buildTypeFilter = (type) => {
  return {
    $or: [{ type: "physical" }, { type: { $exists: false } }]
  };
};

const normalizeProductImages = (images = []) =>
  images
    .map((image) => String(image || "").trim())
    .filter(Boolean)
    .slice(0, 4);

const sanitizeProductPayload = (payload = {}) => {
  const images = normalizeProductImages(payload.images);
  const requestedCover = String(payload.coverImage || "").trim();
  const coverImage = requestedCover || images[0] || "";

  return {
    ...payload,
    type: "physical",
    images,
    coverImage,
    dimensions: payload.dimensions,
    material: payload.material,
    careInstructions: payload.careInstructions,
    isFeatured: Boolean(payload.isFeatured),
    isBestseller: Boolean(payload.isBestseller),
    status: payload.status === "draft" ? "draft" : "published"
  };
};

/*ALL PRODUCT */
export const getAllProducts = async (req, res) => {
    try {
        const { type, q, category, sort, material, minPrice, maxPrice, inStock } = req.query;
        const filter = buildTypeFilter(type);
        
        filter.status = { $ne: "draft" };

        if (q) {
           filter.$or = [
             { name: { $regex: q, $options: "i" } },
             { description: { $regex: q, $options: "i" } }
           ];
        }

        if (category && category !== "All") {
           filter.category = category;
        }

        if (material && material !== "All") {
           filter.material = material;
        }

        if (inStock === "true") {
           filter.stock = { $gt: 0 };
        }

        if (minPrice || maxPrice) {
           filter.price = {};
           if (minPrice) filter.price.$gte = Number(minPrice);
           if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price_asc") sortOption = { price: 1 };
        if (sort === "price_desc") sortOption = { price: -1 };
        if (sort === "newest") sortOption = { createdAt: -1 };

        const products = await Product.find(filter).sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}

/* ---------- GET ALL PRODUCTS FOR ADMIN ---------- */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = buildTypeFilter(type);
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ---------- GET PRODUCT BY ID ---------- */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      $or: [{ type: "physical" }, { type: { $exists: false } }]
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ---------- CREATE PRODUCT (ADMIN) ---------- */

export const createProduct = async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);

    if (payload.images.length === 0) {
      return res.status(400).json({ message: "At least 1 gallery image is required" });
    }

    if (payload.images.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed per product" });
    }

    if (!payload.coverImage) {
      return res.status(400).json({ message: "A listing image is required" });
    }

    const product = await Product.create(payload);
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/*UPDATE PRODUCT (ADMIN) */
export const updateProduct = async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);

    if (payload.images) {
      if (payload.images.length === 0) {
        return res.status(400).json({ message: "At least 1 gallery image is required" });
      }

      if (payload.images.length > 4) {
        return res.status(400).json({ message: "Maximum 4 images allowed per product" });
      }
    }

    if (!payload.coverImage) {
      return res.status(400).json({ message: "A listing image is required" });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ type: "physical" }, { type: { $exists: false } }]
      },
      payload,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


/* ---------- DELETE PRODUCT (ADMIN) ---------- */

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
