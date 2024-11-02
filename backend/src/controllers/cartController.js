const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiResponse');

const cartController = {
  getCart: catchAsync(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    res.json({
      success: true,
      cart,
    });
  }),

  addToCart: catchAsync(async (req, res) => {
    const { productId, quantity } = req.body;

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }
    if (product.stock < quantity) {
      throw new ApiError('Insufficient stock', 400);
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    await cart.populate('items.product');

    res.json({
      success: true,
      cart,
    });
  }),

  updateCartItem: catchAsync(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      throw new ApiError('Item not found in cart', 404);
    }

    // Verify stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new ApiError('Insufficient stock', 400);
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      cart,
    });
  }),

  removeFromCart: catchAsync(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      cart,
    });
  }),

  clearCart: catchAsync(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      throw new ApiError('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  }),
};

module.exports = cartController; 