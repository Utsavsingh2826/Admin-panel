import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CustomizationRequest, { CustomizationStatus } from "../models/CustomizationRequest";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { AuthRequest } from "../types";

// @desc    Get all customization requests (only where partialPaymentStatus is completed)
// @route   GET /api/customization-requests
// @access  Private (Admin, Superadmin)
export const getAllCustomizationRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requests = await CustomizationRequest.find({
    partialPaymentStatus: CustomizationStatus.COMPLETED
  }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: requests,
  });
});

// @desc    Get customization request by ID
// @route   GET /api/customization-requests/:id
// @access  Private (Admin, Superadmin)
export const getCustomizationRequestById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const request = await CustomizationRequest.findById(id);

  if (!request) {
    return next(new ErrorResponse("Customization request not found", 404));
  }

  res.status(200).json({
    success: true,
    data: request,
  });
});

// @desc    Process order from customization request
// @route   POST /api/customization-requests/:id/process-order
// @access  Private (Admin, Superadmin)
export const processOrder = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const customizationRequest = await CustomizationRequest.findById(id);

  if (!customizationRequest) {
    return next(new ErrorResponse("Customization request not found", 404));
  }

  if (customizationRequest.partialPaymentStatus !== CustomizationStatus.COMPLETED) {
    return next(new ErrorResponse("Partial payment must be completed before processing order", 400));
  }

  // Extract customer info from customization request
  const contactInfo = customizationRequest.contactInfo;
  if (!contactInfo) {
    return next(new ErrorResponse("Contact information is missing in customization request", 400));
  }

  // Create order from customization request
  // Convert userId string to ObjectId if it's a valid ObjectId, otherwise use a new ObjectId
  let userIdObjectId: mongoose.Types.ObjectId;
  try {
    userIdObjectId = new mongoose.Types.ObjectId(customizationRequest.userId);
  } catch {
    // If userId is not a valid ObjectId, create a new one (for dummy data)
    userIdObjectId = new mongoose.Types.ObjectId();
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const orderData = {
    orderNumber: orderNumber,
    user: userIdObjectId,
    orderStatus: "pending" as const,
    orderType: "customized" as const,
    items: [{
      lineId: `LINE_${Date.now()}`,
      name: customizationRequest.title,
      productType: customizationRequest.jewelryType.toLowerCase() as any,
      category: customizationRequest.category.toLowerCase() as any,
      category1: customizationRequest.subCategory,
      category2: "",
      category3: "",
      centerStoneShape: customizationRequest.diamondShape || "",
      quantity: 1,
      unitPrice: {
        currency: "INR" as const,
        amount: customizationRequest.finalPrice || customizationRequest.estimatedPrice || 0,
      },
      metal: customizationRequest.metalType ? {
        material: customizationRequest.metalType.toLowerCase() as any,
        color: customizationRequest.metalColor?.toLowerCase() as any,
        karat: customizationRequest.metalKarat as any,
      } : undefined,
      centerStone: customizationRequest.diamondShape ? {
        type: (customizationRequest.diamondOrigin || "natural diamond") as any,
        shape: customizationRequest.diamondShape as any,
        carat: parseFloat(customizationRequest.diamondSize || "0"),
        color: customizationRequest.diamondColor,
        clarity: customizationRequest.diamondClarity,
      } : undefined,
      dimensions: customizationRequest.ringSize ? {
        ringSize: customizationRequest.ringSize,
      } : undefined,
      customization: customizationRequest.engraving ? {
        engraving: {
          text: customizationRequest.engraving.text,
          font: customizationRequest.engraving.font,
          position: customizationRequest.engraving.position,
        },
        notes: customizationRequest.specialInstructions,
      } : {
        notes: customizationRequest.specialInstructions,
      },
      images: [
        ...customizationRequest.referenceImages,
        ...customizationRequest.designImages,
      ],
      lineTotals: {
        subtotal: {
          currency: "INR" as const,
          amount: customizationRequest.finalPrice || customizationRequest.estimatedPrice || 0,
        },
        total: {
          currency: "INR" as const,
          amount: customizationRequest.finalPrice || customizationRequest.estimatedPrice || 0,
        },
      },
    }],
    shippingAddress: {
      street: contactInfo.address,
      city: contactInfo.city,
      state: contactInfo.state,
      zipCode: contactInfo.zipCode,
      country: contactInfo.country,
      sameAsBilling: true,
    },
    billingAddress: {
      street: contactInfo.address,
      city: contactInfo.city,
      state: contactInfo.state,
      zipCode: contactInfo.zipCode,
      country: contactInfo.country,
      sameAsBilling: true,
    },
    subtotal: customizationRequest.finalPrice || customizationRequest.estimatedPrice || 0,
    totalAmount: customizationRequest.finalPrice || customizationRequest.estimatedPrice || 0,
    shippingCharge: 0,
    gst: customizationRequest.priceBreakdown?.gst || 0,
    paymentMethod: "Credit Card", // Default, not COD
    paymentStatus: "pending" as const,
    orderedAt: Date.now(), // Use timestamp instead of Date
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const order = await Order.create(orderData);

  // Update customization request status
  await customizationRequest.updateStatus(CustomizationStatus.COMPLETED, `Order ${order.orderNumber} has been created from this customization request.`);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: {
      order,
      customizationRequest,
    },
  });
});

