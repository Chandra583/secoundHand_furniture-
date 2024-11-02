const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { ApiError } = require('../utils/apiResponse');
const { logger } = require('../middleware/logger');
const Order = require('../models/Order');

class PaymentService {
  async createPaymentIntent(order) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          userId: order.user.toString(),
        },
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      throw new ApiError('Payment processing failed', 500);
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const order = await Order.findById(paymentIntent.metadata.orderId);
        if (order) {
          order.paymentStatus = 'completed';
          order.paymentId = paymentIntentId;
          await order.save();
        }
      }

      return paymentIntent;
    } catch (error) {
      logger.error('Payment confirmation failed:', error);
      throw new ApiError('Payment confirmation failed', 500);
    }
  }

  async processRefund(orderId, amount) {
    try {
      const order = await Order.findById(orderId);
      if (!order || !order.paymentId) {
        throw new ApiError('Order not found or payment ID missing', 404);
      }

      const refund = await stripe.refunds.create({
        payment_intent: order.paymentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      if (refund.status === 'succeeded') {
        order.paymentStatus = 'refunded';
        await order.save();
      }

      return refund;
    } catch (error) {
      logger.error('Refund processing failed:', error);
      throw new ApiError('Refund processing failed', 500);
    }
  }

  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });

      return customer;
    } catch (error) {
      logger.error('Customer creation failed:', error);
      throw new ApiError('Customer creation failed', 500);
    }
  }

  async attachPaymentMethod(customerId, paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(
        paymentMethodId,
        { customer: customerId }
      );

      return paymentMethod;
    } catch (error) {
      logger.error('Payment method attachment failed:', error);
      throw new ApiError('Payment method attachment failed', 500);
    }
  }
}

module.exports = new PaymentService(); 