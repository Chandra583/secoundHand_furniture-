const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateRequest } = require('../middleware/validate');
const { productSchema } = require('../utils/validation');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post(
  '/',
  auth,
  isAdmin,
  upload.array('images', 5),
  validateRequest(productSchema),
  productController.createProduct
);

router.put(
  '/:id',
  auth,
  isAdmin,
  validateRequest(productSchema),
  productController.updateProduct
);

router.delete('/:id', auth, isAdmin, productController.deleteProduct);

// Rating routes (authenticated users)
router.post('/:id/ratings', auth, productController.addRating);

module.exports = router; 