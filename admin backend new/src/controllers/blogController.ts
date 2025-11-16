import { Request, Response, NextFunction } from "express";
import Blog from "../models/Blog";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { AuthRequest } from "../types";
import cloudinary from "../config/cloudinary";

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await Blog.find({}).sort({
    createdAt: -1,
  }); // latest first

  res.status(200).json({
    success: true,
    data: blogs,
  });
});

// @desc    Get a blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Admin, Superadmin)
export const createBlog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, notes } = req.body;

  if (!title || !notes) {
    return res.status(400).json({
      success: false,
      message: "Title and notes are required",
    });
  }

  // Check if display image was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Display image is required",
    });
  }

  // Create blog with display image
  // CloudinaryStorage provides: path (URL), filename (public_id)
  const blog = await Blog.create({
    title,
    notes,
    displayImage: req.file.path || req.file.secure_url || req.file.url,
    displayImagePublicId: req.file.filename || req.file.public_id,
    images: [], // Additional images will be added separately if needed
  });

  res.status(201).json({
    success: true,
    data: blog,
  });
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin, Superadmin)
export const updateBlog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, notes } = req.body;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  // Update fields
  if (title) blog.title = title;
  if (notes) blog.notes = notes;

  // If new display image is uploaded, delete old one and update
  if (req.file) {
    // Delete old image from Cloudinary
    if (blog.displayImagePublicId) {
      try {
        await cloudinary.uploader.destroy(blog.displayImagePublicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }
    blog.displayImage = req.file.path || req.file.secure_url || req.file.url;
    blog.displayImagePublicId = req.file.filename || req.file.public_id;
  }

  await blog.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin, Superadmin)
export const deleteBlog = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  // Delete display image from Cloudinary
  if (blog.displayImagePublicId) {
    try {
      await cloudinary.uploader.destroy(blog.displayImagePublicId);
    } catch (error) {
      console.error("Error deleting display image:", error);
    }
  }

  // Delete additional images from Cloudinary
  if (blog.images && blog.images.length > 0) {
    try {
      const publicIds = blog.images.map((img) => img.publicId);
      await cloudinary.api.delete_resources(publicIds);
    } catch (error) {
      console.error("Error deleting additional images:", error);
    }
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

// @desc    Add images to a blog
// @route   POST /api/blogs/:id/images
// @access  Private (Admin, Superadmin)
export const addBlogImages = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image is required",
    });
  }

  const files = req.files as Express.Multer.File[];
  const newImages = files.map((file: any) => ({
    url: file.path || file.secure_url || file.url,
    publicId: file.filename || file.public_id,
  }));

  blog.images = [...blog.images, ...newImages];
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});

// @desc    Delete an image from a blog
// @route   DELETE /api/blogs/:id/images/:publicId
// @access  Private (Admin, Superadmin)
export const deleteBlogImage = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id, publicId } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new ErrorResponse("Blog not found", 404));
  }

  // Find and remove the image
  const imageIndex = blog.images.findIndex((img) => img.publicId === publicId);

  if (imageIndex === -1) {
    return next(new ErrorResponse("Image not found", 404));
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image:", error);
  }

  // Remove from array
  blog.images.splice(imageIndex, 1);
  await blog.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});

