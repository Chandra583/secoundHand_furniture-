import express from 'express';
import cartController from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { cartItemSchema } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', cartController.getCart);
router.post('/items', validateRequest(cartItemSchema), cartController.addToCart);
router.put('/items/:productId', validateRequest(cartItemSchema), cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;