const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

const authController = {
  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Generate token
    const token = user.generateAuthToken();

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }),

  // Function to refresh token
  refreshToken: catchAsync(async (req, res) => {
    const user = req.user; // From auth middleware
    const token = user.generateAuthToken();

    res.json({
      success: true,
      token
    });
  })
};

module.exports = authController; 