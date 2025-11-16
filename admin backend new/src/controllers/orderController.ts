import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { AuthRequest } from "../types";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin, Superadmin)
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,
    data: orders,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin, Superadmin)
export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('user', 'name email');

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    data: order,
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
  order.status = status;
  order.orderStatus = status; // Sync legacy field

  // Add to status history
  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  order.statusHistory.push({
    status,
    date: new Date(),
    note: note || `Status updated to ${status}`,
  });

  // Update timeline dates based on status
  if (status === "shipped" && !order.shippedAt) {
    order.shippedAt = new Date();
    if (order.shipping) {
      order.shipping.shippedAt = new Date();
    }
  } else if (status === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  } else if (status === "cancelled" && !order.cancelledAt) {
    order.cancelledAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

