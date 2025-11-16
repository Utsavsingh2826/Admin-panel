import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { createShipment } from '../controllers/shipmentController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.post('/:id/create-shipment', createShipment);

export default router;

