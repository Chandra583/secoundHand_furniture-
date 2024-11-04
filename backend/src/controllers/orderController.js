import Order from '../models/Order.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import { ApiError } from '../utils/apiResponse.js';
import { processPayment } from '../services/payment.service.js';
import { sendEmail } from '../services/email.service.js';

export const createOrder = catchAsync(async (req, res) => {
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
    subject: "Order Confirmation",
    text: `Your order #${order._id} has been received and is being processed.`,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

export const getOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("user", "name email");

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    throw new ApiError("Not authorized", 403);
  }

  res.json({
    success: true,
    order,
  });
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product")
    .sort("-createdAt");

  res.json({
    success: true,
    orders,
  });
});

export const getAllOrders = catchAsync(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError("Not authorized", 403);
  }

  const orders = await Order.find()
    .populate("items.product")
    .populate("user", "name email")
    .sort("-createdAt");

  res.json({
    success: true,
    orders,
  });
});

export const updateOrderStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (req.user.role !== "admin") {
    throw new ApiError("Not authorized", 403);
  }

  order.status = status;
  await order.save();

  // Send status update email
  await sendEmail({
    to: order.user.email,
    subject: "Order Status Update",
    text: `Your order #${order._id} status has been updated to ${status}.`,
  });

  res.json({
    success: true,
    order,
  });
});

export const deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  if (req.user.role !== "admin") {
    throw new ApiError("Not authorized", 403);
  }

  await order.remove();

  res.json({
    success: true,
    message: "Order deleted successfully",
  });
});
