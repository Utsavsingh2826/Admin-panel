import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addBlogImages,
  deleteBlogImage,
} from '../controllers/blogController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { uploadDisplayImage, uploadImages, handleUploadError } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes - Admin and Superadmin only
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Create blog with display image
router.post('/', uploadDisplayImage, handleUploadError, createBlog);

// Update blog (with optional display image)
router.put('/:id', uploadDisplayImage, handleUploadError, updateBlog);

// Delete blog
router.delete('/:id', deleteBlog);

// Add images to blog
router.post('/:id/images', uploadImages, handleUploadError, addBlogImages);

// Delete image from blog
router.delete('/:id/images/:publicId', deleteBlogImage);

export default router;

