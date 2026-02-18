import express from 'express';
import {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import {protect} from '../middleware/authMiddleware.js';
import {adminOnly} from'../middleware/adminMiddleware.js';
const router=express.Router();

/*Public Routes */
router.get('/',getAllProducts);

/*Admin Read Route */
router.get('/admin/all',protect,adminOnly,getAllProductsAdmin);

router.get('/:id',getProductById);

/*admin routes */

router.post('/',protect,adminOnly,createProduct);
router.put('/:id',protect,adminOnly,updateProduct);
router.delete('/:id',protect,adminOnly,deleteProduct);

export default router;
