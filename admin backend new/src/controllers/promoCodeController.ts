import { Response, NextFunction } from 'express';
import PromoCode from '../models/PromoCode';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

// @desc    Get all promo codes
// @route   GET /api/promocodes
// @access  Private/Superadmin
export const getPromoCodes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string || '';
  const status = req.query.status as string || '';

  // Build query
  const query: any = {};
  if (search) {
    query.code = { $regex: search, $options: 'i' };
  }
  if (status) {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }

  // Get promo codes
  const promoCodes = await PromoCode.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await PromoCode.countDocuments(query);

  res.status(200).json({
    success: true,
    count: promoCodes.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: promoCodes,
  });
});

// @desc    Get single promo code
// @route   GET /api/promocodes/:id
// @access  Private/Superadmin
export const getPromoCode = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const promoCode = await PromoCode.findById(req.params.id).populate('createdBy', 'name email');

  if (!promoCode) {
    return next(new ErrorResponse(`Promo code not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: promoCode,
  });
});

// @desc    Create promo code
// @route   POST /api/promocodes
// @access  Private/Superadmin
export const createPromoCode = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, discountPercent, description, isActive } = req.body;

  // Validate required fields
  if (!code || !discountPercent) {
    return next(new ErrorResponse('Please provide code and discount percent', 400));
  }

  // Validate discount percent
  if (discountPercent < 1 || discountPercent > 100) {
    return next(new ErrorResponse('Discount percent must be between 1 and 100', 400));
  }

  // Check if promo code exists
  const existingPromoCode = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existingPromoCode) {
    return next(new ErrorResponse('Promo code already exists', 400));
  }

  // Create promo code
  const promoCode = await PromoCode.create({
    code: code.toUpperCase(),
    discountPercent,
    description: description || '',
    isActive: isActive !== undefined ? isActive : true,
    createdBy: req.user!._id,
  });

  const populatedPromoCode = await PromoCode.findById(promoCode._id).populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: populatedPromoCode,
  });
});

// @desc    Update promo code
// @route   PUT /api/promocodes/:id
// @access  Private/Superadmin
export const updatePromoCode = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { discountPercent, description, isActive } = req.body;

  let promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    return next(new ErrorResponse(`Promo code not found with id of ${req.params.id}`, 404));
  }

  // Update fields (code cannot be changed)
  if (discountPercent !== undefined) {
    if (discountPercent < 1 || discountPercent > 100) {
      return next(new ErrorResponse('Discount percent must be between 1 and 100', 400));
    }
    promoCode.discountPercent = discountPercent;
  }
  if (description !== undefined) promoCode.description = description;
  if (isActive !== undefined) promoCode.isActive = isActive;

  await promoCode.save();

  const populatedPromoCode = await PromoCode.findById(promoCode._id).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    data: populatedPromoCode,
  });
});

// @desc    Delete promo code
// @route   DELETE /api/promocodes/:id
// @access  Private/Superadmin
export const deletePromoCode = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    return next(new ErrorResponse(`Promo code not found with id of ${req.params.id}`, 404));
  }

  await promoCode.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Promo code deleted successfully',
  });
});

// @desc    Toggle promo code active status
// @route   PATCH /api/promocodes/:id/toggle-status
// @access  Private/Superadmin
export const togglePromoCodeStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const promoCode = await PromoCode.findById(req.params.id);

  if (!promoCode) {
    return next(new ErrorResponse(`Promo code not found with id of ${req.params.id}`, 404));
  }

  promoCode.isActive = !promoCode.isActive;
  await promoCode.save();

  const populatedPromoCode = await PromoCode.findById(promoCode._id).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    data: populatedPromoCode,
    message: `Promo code ${promoCode.isActive ? 'activated' : 'deactivated'} successfully`,
  });
});

// @desc    Validate promo code (for user website - public endpoint)
// @route   POST /api/promocodes/validate
// @access  Public
export const validatePromoCode = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return next(new ErrorResponse('Please provide a promo code', 400));
  }

  if (!orderAmount || orderAmount <= 0) {
    return next(new ErrorResponse('Please provide a valid order amount', 400));
  }

  // Find promo code (case-insensitive)
  const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });

  if (!promoCode) {
    return res.status(200).json({
      success: true,
      valid: false,
      error: 'Promo code not found',
    });
  }

  // Check if active
  if (!promoCode.isActive) {
    return res.status(200).json({
      success: true,
      valid: false,
      error: 'Promo code is inactive',
    });
  }

  // Calculate discount
  const discountAmount = (orderAmount * promoCode.discountPercent) / 100;
  const finalAmount = orderAmount - discountAmount;

  res.status(200).json({
    success: true,
    valid: true,
    data: {
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    },
  });
});

