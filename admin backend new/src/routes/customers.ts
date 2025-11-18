import express from 'express';
import {
  getCustomers,
  getCustomer,
  updateCustomer,
  toggleCustomerStatus,
} from '../controllers/customerController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.route('/')
  .get(getCustomers);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer);

router.route('/:id/toggle-status')
  .patch(toggleCustomerStatus);

export default router;


