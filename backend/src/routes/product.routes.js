import express from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  addRating 
} from '../controllers/productController.js';
import { auth, isAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { productSchema } from '../utils/validation.js';

const router = express.Router();

// Product routes
router.post('/', auth, isAdmin, validateRequest(productSchema), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', auth, isAdmin, validateRequest(productSchema), updateProduct);
router.delete('/:id', auth, isAdmin, deleteProduct);
router.post('/:id/ratings', auth, addRating);

export default router;