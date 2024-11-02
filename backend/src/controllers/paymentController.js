const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiResponse');

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

  refundPayment: catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (!order.paymentId) {
      throw new ApiError('No payment found for this order', 400);
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.paymentId,
      reason: reason || 'requested_by_customer',
    });

    order.paymentStatus = 'refunded';
    await order.save();

    res.json({
      success: true,
      refund,
    });
  }),
};

module.exports = paymentController; 