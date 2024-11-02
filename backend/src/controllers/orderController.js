const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiResponse');
const { processPayment } = require('../services/payment.service');
const { sendEmail } = require('../services/email.service');

const orderController = {
  createOrder: catchAsync(async (req, res) => {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id;

    // Calculate total amount and verify stock
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ApiError(`Product ${item.product} not found`, 404);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(`Insufficient stock for ${product.name}`, 400);
      }
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send order confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Order Confirmation',
      text: `Your order #${order._id} has been received and is being processed.`,
    });

    res.status(201).json({
      success: true,
      order,
    });
  }),

  getOrders: catchAsync(async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort('-createdAt');

    res.json({
      success: true,
      orders,
    });
  }),

  getOrderById: catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError('Not authorized', 403);
    }

    res.json({
      success: true,
      order,
    });
  }),

  updateOrderStatus: catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    order.status = status;
    await order.save();

    // Send status update email
    await sendEmail({
      to: req.user.email,
      subject: 'Order Status Update',
      text: `Your order #${order._id} status has been updated to ${status}.`,
    });

    res.json({
      success: true,
      order,
    });
  }),

  cancelOrder: catchAsync(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new ApiError('Order not found', 404);
    }

    if (order.status !== 'pending') {
      throw new ApiError('Order cannot be cancelled', 400);
    }

    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // Send cancellation email
    await sendEmail({
      to: req.user.email,
      subject: 'Order Cancelled',
      text: `Your order #${order._id} has been cancelled.`,
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  }),
};

module.exports = orderController; 