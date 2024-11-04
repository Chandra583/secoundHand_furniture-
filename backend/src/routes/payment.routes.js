import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { auth, isAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { paymentSchema } from '../utils/validation.js';

const router = express.Router();

// Customer routes
router.post('/create-payment-intent', auth, validateRequest(paymentSchema), paymentController.createPaymentIntent);
router.post('/confirm', auth, paymentController.confirmPayment);
router.get('/status/:paymentIntentId', auth, paymentController.getPaymentStatus);

// Admin routes
router.post('/:orderId/refund', auth, isAdmin, paymentController.refundPayment);
router.get('/admin/transactions', auth, isAdmin, paymentController.getTransactions);

export default router;