import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  unlockUser,
  resetPassword,
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// All routes require authentication and superadmin role
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/toggle-status')
  .patch(toggleUserStatus);

router.route('/:id/unlock')
  .patch(unlockUser);

router.route('/:id/reset-password')
  .patch(resetPassword);

export default router;

