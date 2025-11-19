import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Admin, Superadmin)
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string || '';
  const category = req.query.category as string || '';
  const subCategory = req.query.subCategory as string || '';

  // Build query
  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { variant: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  if (subCategory) {
    query.subCategory = { $regex: subCategory, $options: 'i' };
  }

  // Get products
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: products,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private (Admin, Superadmin)
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Get product by SKU
// @route   GET /api/products/sku/:sku
// @access  Private (Admin, Superadmin)
export const getProductBySku = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findOne({ sku: req.params.sku });

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin, Superadmin)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    sku,
    variant,
    title,
    description,
    category,
    subCategory,
    price,
    metal,
    karat,
    diamondShape,
    diamondSize,
    isGiftingAvailable,
    isEngraving,
    images,
  } = req.body;

  // Validate required fields
  if (!sku || !title || !category || price === undefined) {
    return next(new ErrorResponse('Please provide sku, title, category, and price', 400));
  }

  // Check if product with SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    return next(new ErrorResponse('Product with this SKU already exists', 400));
  }

  // Create product
  const product = await Product.create({
    sku,
    variant,
    title,
    description,
    category,
    subCategory,
    price,
    metal,
    karat,
    diamondShape,
    diamondSize,
    isGiftingAvailable: isGiftingAvailable !== undefined ? isGiftingAvailable : false,
    isEngraving: isEngraving !== undefined ? isEngraving : false,
    images,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Superadmin)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if SKU is being changed and if it's already taken
  if (req.body.sku && req.body.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return next(new ErrorResponse('Product with this SKU already exists', 400));
    }
  }

  // Update fields
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      (product as any)[key] = req.body[key];
    }
  });

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin, Superadmin)
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Product deleted successfully',
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Private (Admin, Superadmin)
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await Product.distinct('category');
  const subCategories = await Product.distinct('subCategory');

  res.status(200).json({
    success: true,
    data: {
      categories: categories.filter(Boolean),
      subCategories: subCategories.filter(Boolean),
    },
  });
});



