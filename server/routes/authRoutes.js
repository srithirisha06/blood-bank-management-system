import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator, resetPasswordValidator } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPasswordValidator, validate, resetPassword);

export default router;
