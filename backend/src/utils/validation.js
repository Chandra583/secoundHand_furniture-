const { body, param, query } = require('express-validator');

const validation = {
  // Auth validation schemas
  registerSchema: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
      .withMessage('Password must contain at least one number, one lowercase and one uppercase letter'),
  ],

  // Product validation schemas
  productSchema: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 2, max: 100 }),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a positive integer'),
  ],

  // Order validation schemas
  orderSchema: [
    body('items')
      .isArray()
      .withMessage('Items must be an array')
      .notEmpty()
      .withMessage('Order must contain at least one item'),
    body('items.*.product')
      .isMongoId()
      .withMessage('Invalid product ID'),
  ],
};

module.exports = validation; 