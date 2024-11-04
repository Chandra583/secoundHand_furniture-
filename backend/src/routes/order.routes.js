import express from 'express';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { orderSchema } from '../utils/validation.js';
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Order routes
router.post('/', auth, validateRequest(orderSchema), createOrder);
router.get('/me', auth, getMyOrders);
router.get('/:id', auth, getOrder);
router.get('/', auth, getAllOrders);
router.put('/:id/status', auth, updateOrderStatus);
router.delete('/:id', auth, deleteOrder);

export default router;