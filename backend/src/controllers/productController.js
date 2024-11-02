const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiResponse');
const { uploadImage } = require('../services/upload.service');

const productController = {
  createProduct: catchAsync(async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    const images = req.files;

    // Upload images
    const uploadedImages = await Promise.all(
      images.map(image => uploadImage(image))
    );

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: uploadedImages,
    });

    res.status(201).json({
      success: true,
      product,
    });
  }),

  getAllProducts: catchAsync(async (req, res) => {
    const { page = 1, limit = 10, category, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  }),

  getProductById: catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    res.json({
      success: true,
      product,
    });
  }),

  updateProduct: catchAsync(async (req, res) => {
    const updates = req.body;
    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    res.json({
      success: true,
      product,
    });
  }),

  deleteProduct: catchAsync(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  }),

  addRating: catchAsync(async (req, res) => {
    const { rating, review } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    // Check if user already rated
    const existingRating = product.ratings.find(
      r => r.user.toString() === userId
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      product.ratings.push({ user: userId, rating, review });
    }

    // Calculate average rating
    product.averageRating = product.ratings.reduce((acc, item) => acc + item.rating, 0) / product.ratings.length;

    await product.save();

    res.json({
      success: true,
      product,
    });
  }),
};

module.exports = productController; 