const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { orderSchema } = require('../utils/validation');

// Customer routes
router.post(
  '/',
  auth,
  validateRequest(orderSchema),
  orderController.createOrder
);

router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/:id/cancel', auth, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', auth, isAdmin, orderController.getAllOrders);
router.put(
  '/:id/status',
  auth,
  isAdmin,
  orderController.updateOrderStatus
);

module.exports = router; 