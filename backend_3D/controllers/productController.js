import Product from "../models/Product.js";

/*ALL PRODUCT */
export const getAllProducts=async(req,res)=>{
    try {
        const {type}=req.query;
        let filter={};
        if(type){
            filter.type=type;
        }
        const products=await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}

/* ---------- GET PRODUCT BY ID ---------- */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
    const product = await Product.create(req.body);
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/*UPDATE PRODUCT (ADMIN) */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
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