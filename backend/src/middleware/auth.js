const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError('Authentication failed', 401));
  }
};

// Middleware for admin-only routes
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError('Admin access required', 403));
  }
};

module.exports = { auth, isAdmin }; 