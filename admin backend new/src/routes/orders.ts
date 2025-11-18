import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { createShipment, trackShipment, trackMultipleShipments } from '../controllers/shipmentController';
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
router.post('/track', trackShipment);
router.post('/track-multiple', trackMultipleShipments);

export default router;

