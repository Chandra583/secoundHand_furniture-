import Stripe from 'stripe';
import Order from '../models/Order.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiError } from '../utils/apiResponse.js';
import { body } from 'express-validator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const paymentSchema = {
  createPayment: [
    body('orderId')
      .trim()
      .notEmpty()
      .withMessage('Order ID is required')
      .isMongoId()
      .withMessage('Invalid order ID')
  ],
  confirmPayment: [
    body('orderId')
      .trim() 
      .notEmpty()
      .withMessage('Order ID is required')
      .isMongoId()
      .withMessage('Invalid order ID'),
    body('paymentIntentId')
      .trim()
      .notEmpty()
      .withMessage('Payment intent ID is required')
  ],
  refundPayment: [
    body('reason')
      .optional()
      .trim()
      .isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
      .withMessage('Invalid refund reason')
  ]
};

const paymentController = {
  createPaymentIntent: catchAsync(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: orderId,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  }),

  confirmPayment: catchAsync(async (req, res) => {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'completed';
      order.paymentId = paymentIntentId;
      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
      });
    } else {
      throw new ApiError('Payment failed', 400);
    }
  }),

  getPaymentStatus: catchAsync(async (req, res) => {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({
      success: true,
      status: paymentIntent.status,
    });
  }),

  getTransactions: catchAsync(async (req, res) => {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });
    res.json({
      success: true,
      transactions: paymentIntents.data,
    });
  }),

  refundPayment: catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const refund = await processRefund(orderId);
    
    res.json({
      success: true,
      refund,
    });
  }),
};

export default paymentController;