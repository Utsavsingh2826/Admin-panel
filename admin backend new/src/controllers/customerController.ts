import { Response } from 'express';
import User from '../models/User';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

// @desc    Get all customers (users with role="customer")
// @route   GET /api/customers
// @access  Private (Admin, Superadmin)
export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string || '';
  const status = req.query.status as string || '';

  // Build query - only customers
  const query: any = {
    role: 'customer',
  };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'unverified') {
      query.isVerified = false;
    }
  }

  // Get customers with populated orders count
  const customers = await User.find(query)
    .select('-password -twoFactorCode -twoFactorCodeExpires -loginAttempts -lockUntil')
    .populate({
      path: 'orders',
      select: '_id orderNumber orderStatus totalAmount',
      options: { limit: 5 }, // Limit to 5 recent orders
    })
    .populate({
      path: 'referredBy',
      select: 'name email',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: customers.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: customers,
  });
});

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Admin, Superadmin)
export const getCustomer = asyncHandler(async (req: AuthRequest, res: Response, next: any) => {
  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  })
    .select('-password -twoFactorCode -twoFactorCodeExpires -loginAttempts -lockUntil')
    .populate({
      path: 'orders',
      select: 'orderNumber orderStatus totalAmount orderedAt',
      options: { sort: { orderedAt: -1 } },
    })
    .populate({
      path: 'wishlist',
      select: 'name price images',
    })
    .populate({
      path: 'referredBy',
      select: 'name email referralCode',
    });

  if (!customer) {
    return next(new ErrorResponse('Customer not found', 404));
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin, Superadmin)
export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response, next: any) => {
  const {
    firstName,
    lastName,
    name,
    email,
    phone,
    isActive,
    isVerified,
    availableOffers,
    refDiscount,
    address,
  } = req.body;

  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  });

  if (!customer) {
    return next(new ErrorResponse('Customer not found', 404));
  }

  // Update fields
  if (firstName !== undefined) customer.firstName = firstName;
  if (lastName !== undefined) customer.lastName = lastName;
  if (name !== undefined) customer.name = name;
  if (email !== undefined) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: customer._id },
    });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
    customer.email = email.toLowerCase();
  }
  if (phone !== undefined) customer.phone = phone;
  if (isActive !== undefined) customer.isActive = isActive;
  if (isVerified !== undefined) customer.isVerified = isVerified;
  if (availableOffers !== undefined) customer.availableOffers = availableOffers;
  if (refDiscount !== undefined) customer.refDiscount = refDiscount;
  if (address !== undefined) customer.address = address;

  await customer.save();

  const customerResponse = customer.toJSON();

  res.status(200).json({
    success: true,
    data: customerResponse,
  });
});

// @desc    Toggle customer active status
// @route   PATCH /api/customers/:id/toggle-status
// @access  Private (Admin, Superadmin)
export const toggleCustomerStatus = asyncHandler(async (req: AuthRequest, res: Response, next: any) => {
  const customer = await User.findOne({
    _id: req.params.id,
    role: 'customer',
  });

  if (!customer) {
    return next(new ErrorResponse('Customer not found', 404));
  }

  customer.isActive = !customer.isActive;
  await customer.save();

  const customerResponse = customer.toJSON();

  res.status(200).json({
    success: true,
    data: customerResponse,
    message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
  });
});



