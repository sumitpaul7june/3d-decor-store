import Product from "../models/Product.js";

const buildTypeFilter = (type) => {
  return {
    type: "physical"
  };
};

/*ALL PRODUCT */
export const getAllProducts=async(req,res)=>{
    try {
        const {type}=req.query;
        const filter = buildTypeFilter(type);

        const products = await Product.find(filter);
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
      type: "physical"
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
    const payload = { ...req.body };

    if (!Array.isArray(payload.images) || payload.images.length === 0) {
      return res.status(400).json({ message: "At least 1 product image is required" });
    }

    if (payload.images.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed per product" });
    }

    payload.type = "physical";

    const product = await Product.create(payload);
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/*UPDATE PRODUCT (ADMIN) */
export const updateProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.images) {
      if (!Array.isArray(payload.images) || payload.images.length === 0) {
        return res.status(400).json({ message: "At least 1 product image is required" });
      }

      if (payload.images.length > 4) {
        return res.status(400).json({ message: "Maximum 4 images allowed per product" });
      }
    }

    payload.type = "physical";

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        type: "physical"
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
