import express from "express";
import { validateRequest } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import { register, login, logout, resetPassword, forgotPassword } from "../controllers/authController.js";
import {
  registerSchema,
  loginSchema,
  passwordResetSchema,
} from "../utils/validation.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  register
);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", auth, logout);
router.post(
  "/reset-password",
  validateRequest(passwordResetSchema),
  resetPassword
);
router.post("/forgot-password", forgotPassword);

// Protected routes
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
