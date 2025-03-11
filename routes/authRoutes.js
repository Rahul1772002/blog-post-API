import express from 'express';
import {
  signup,
  login,
  logout,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
} from '../controllers/authControllers.js';
import { identifier } from '../middlewares/identification.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', identifier, logout);

router.patch('/send-verification-code', identifier, sendVerificationCode);
router.patch('/verify-verification-code', identifier, verifyVerificationCode);
router.patch('/change-password', identifier, changePassword);
router.patch('/send-forgot-password-code', sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', verifyForgotPasswordCode);
export default router;
