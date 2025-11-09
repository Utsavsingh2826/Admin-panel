import express from 'express';
import {
  login,
  verify2FA,
  resend2FA,
  getMe,
  logout,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/resend-2fa', resend2FA);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

