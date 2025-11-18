import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { AuthRequest } from "../types";

// Helper function to transform order for frontend
const transformOrderForFrontend = (orderObj: any) => {
  // Transform user to customer format for frontend
  const customer = orderObj.user ? {
    id: orderObj.user._id || orderObj.user,
    email: orderObj.user.email || '',
    firstName: orderObj.user.name?.split(' ')[0] || orderObj.user.firstName || '',
    lastName: orderObj.user.name?.split(' ').slice(1).join(' ') || orderObj.user.lastName || '',
    phone: orderObj.user.phone || '',
  } : undefined;

  return {
    ...orderObj,
    number: orderObj.orderNumber || orderObj.number,
    status: orderObj.orderStatus || orderObj.status,
    customer,
    shippingAddress: orderObj.shippingAddress ? {
      ...orderObj.shippingAddress,
      line1: orderObj.shippingAddress.street || orderObj.shippingAddress.line1 || '',
      postalCode: orderObj.shippingAddress.zipCode || orderObj.shippingAddress.postalCode || '',
    } : undefined,
    billingAddress: orderObj.billingAddress ? {
      ...orderObj.billingAddress,
      line1: orderObj.billingAddress.street || orderObj.billingAddress.line1 || '',
      postalCode: orderObj.billingAddress.zipCode || orderObj.billingAddress.postalCode || '',
    } : undefined,
    payment: {
      method: orderObj.paymentMethod || 'Credit Card',
      status: orderObj.paymentStatus || 'pending',
      transactionId: orderObj.transactionId,
    },
    pricing: {
      currency: 'INR',
      subtotal: orderObj.subtotal || 0,
      discount: 0,
      shipping: orderObj.shippingCharge || 0,
      tax: orderObj.gst || 0,
      total: orderObj.totalAmount || 0,
    },
    shipping: orderObj.trackingInfo?.events?.[0] ? {
      method: 'standard',
      carrier: orderObj.trackingInfo.events[0].carrier || 'Unknown',
      trackingNumber: orderObj.trackingInfo.events[0].docketNumber || orderObj.trackingNumber,
      shippedAt: orderObj.trackingInfo.events[0].date ? new Date(orderObj.trackingInfo.events[0].date).toISOString() : undefined,
    } : undefined,
    trackingNumber: orderObj.trackingInfo?.events?.[0]?.docketNumber || orderObj.trackingNumber,
    courierService: orderObj.trackingInfo?.events?.[0]?.carrier || orderObj.courierService,
    orderedAt: orderObj.orderedAt ? (typeof orderObj.orderedAt === 'number' ? new Date(orderObj.orderedAt).toISOString() : orderObj.orderedAt) : new Date().toISOString(),
    createdAt: orderObj.createdAt ? (typeof orderObj.createdAt === 'number' ? new Date(orderObj.createdAt).toISOString() : orderObj.createdAt) : new Date().toISOString(),
    updatedAt: orderObj.updatedAt ? (typeof orderObj.updatedAt === 'number' ? new Date(orderObj.updatedAt).toISOString() : orderObj.updatedAt) : new Date().toISOString(),
  };
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin, Superadmin)
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'user',
        select: 'name email phone firstName lastName',
        strictPopulate: false, // Don't throw error if user doesn't exist
      })
      .sort({
        orderedAt: -1, // Use orderedAt instead of createdAt for better consistency
      });

    // Convert to plain objects and transform to match frontend expectations
    const ordersData = orders.map(order => {
      const orderObj = order.toObject ? order.toObject() : order;
      return transformOrderForFrontend(orderObj);
    });

    res.status(200).json({
      success: true,
      data: ordersData || [],
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    // Return empty array instead of failing
    res.status(200).json({
      success: true,
      data: [],
      message: error.message || 'Error fetching orders',
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin, Superadmin)
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('user', 'name email phone');

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  const orderObj = order.toObject ? order.toObject() : order;
  const transformed = transformOrderForFrontend(orderObj);

  res.status(200).json({
    success: true,
    data: transformed,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Superadmin)
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  const validStatuses = ["pending", "confirmed", "in_production", "ready_for_dispatch", "shipped", "delivered", "cancelled", "refunded"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse("Invalid order status", 400));
  }

  // Update status
  order.orderStatus = status;

  // Add to status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  order.statusHistory.push({
    status,
    date: Date.now(), // Use timestamp (number) instead of Date object
    note: note || `Status updated to ${status}`,
  });

  // Update timeline dates based on status (store as timestamps)
  const now = Date.now();
  if (status === "shipped") {
    // Store in trackingInfo if available
    if (!order.trackingInfo) {
      order.trackingInfo = { events: [], trackingHistory: [] };
    }
    // Add shipped event to tracking history
    if (!order.trackingInfo.events) {
      order.trackingInfo.events = [];
    }
    order.trackingInfo.events.push({
      status: 'shipped',
      date: now,
      note: 'Order shipped',
    });
  } else if (status === "delivered") {
    if (!order.trackingInfo) {
      order.trackingInfo = { events: [], trackingHistory: [] };
    }
    if (!order.trackingInfo.events) {
      order.trackingInfo.events = [];
    }
    order.trackingInfo.events.push({
      status: 'delivered',
      date: now,
      note: 'Order delivered',
    });
  } else if (status === "cancelled") {
    if (!order.trackingInfo) {
      order.trackingInfo = { events: [], trackingHistory: [] };
    }
    if (!order.trackingInfo.events) {
      order.trackingInfo.events = [];
    }
    order.trackingInfo.events.push({
      status: 'cancelled',
      date: now,
      note: 'Order cancelled',
    });
  }

  await order.save();

  const orderObj = order.toObject ? order.toObject() : order;
  const transformed = transformOrderForFrontend(orderObj);

  res.status(200).json({
    success: true,
    data: transformed,
  });
});

