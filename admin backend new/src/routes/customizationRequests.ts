import express from 'express';
import {
  getAllCustomizationRequests,
  getCustomizationRequestById,
  processOrder,
} from '../controllers/customizationRequestController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getAllCustomizationRequests);
router.get('/:id', getCustomizationRequestById);
router.post('/:id/process-order', processOrder);

export default router;

