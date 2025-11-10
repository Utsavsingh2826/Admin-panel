import express from 'express';
import {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
  validatePromoCode,
} from '../controllers/promoCodeController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// Public route for validation (used by user website)
router.route('/validate').post(validatePromoCode);

// All other routes require authentication and superadmin role
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getPromoCodes)
  .post(createPromoCode);

router.route('/:id')
  .get(getPromoCode)
  .put(updatePromoCode)
  .delete(deletePromoCode);

router.route('/:id/toggle-status')
  .patch(togglePromoCodeStatus);

export default router;

