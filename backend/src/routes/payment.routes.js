const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { paymentSchema } = require('../utils/validation');

// Customer routes
router.post(
  '/create-payment-intent',
  auth,
  validateRequest(paymentSchema),
  paymentController.createPaymentIntent
);

router.post(
  '/confirm',
  auth,
  paymentController.confirmPayment
);

router.get(
  '/status/:paymentIntentId',
  auth,
  paymentController.getPaymentStatus
);

// Admin routes
router.post(
  '/:orderId/refund',
  auth,
  isAdmin,
  paymentController.refundPayment
);

router.get(
  '/admin/transactions',
  auth,
  isAdmin,
  paymentController.getTransactions
);

module.exports = router; 