import express from 'express';
import { getDefaultValues, updateDefaultValue } from '../controllers/defaultValueController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin'));

router.route('/').get(getDefaultValues);
router.route('/:id').patch(updateDefaultValue);

export default router;
