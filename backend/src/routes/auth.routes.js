const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validate');
const auth = require('../middleware/auth');

// Validation schemas
const {
  registerSchema,
  loginSchema,
  passwordResetSchema,
} = require('../utils/validation');

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post(
  '/reset-password',
  validateRequest(passwordResetSchema),
  authController.resetPassword
);

// Protected routes
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});
router.post('/logout', auth, authController.logout);

module.exports = router; 