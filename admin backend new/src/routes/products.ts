import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/categories')
  .get(getCategories);

router.route('/sku/:sku')
  .get(getProductBySku);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;


