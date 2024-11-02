const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiResponse');

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await Promise.all(schema.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError('Validation Error', 400, errors.array());
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

module.exports = { validateRequest, apiLimiter }; 