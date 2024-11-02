const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { cartItemSchema } = require('../utils/validation');

// All routes require authentication
router.use(auth);

router.get('/', cartController.getCart);

router.post(
  '/items',
  validateRequest(cartItemSchema),
  cartController.addToCart
);

router.put(
  '/items/:productId',
  validateRequest(cartItemSchema),
  cartController.updateCartItem
);

router.delete('/items/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router; 