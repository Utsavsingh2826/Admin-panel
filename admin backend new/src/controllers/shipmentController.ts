import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { AuthRequest } from "../types";
import SequelLogisticsService from "../services/sequelLogistics";

// @desc    Create shipment for an order
// @route   POST /api/orders/:id/create-shipment
// @access  Private (Admin, Superadmin)
export const createShipment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Check if shipment already exists
  if (order.shipping?.trackingNumber) {
    return next(new ErrorResponse("Shipment already created for this order", 400));
  }

  // Validate required fields
  if (!order.shippingAddress || !order.customer) {
    return next(new ErrorResponse("Shipping address or customer information is missing", 400));
  }

  if (!order.shippingAddress.postalCode || order.shippingAddress.postalCode.length !== 6) {
    return next(new ErrorResponse("Invalid postal code", 400));
  }

  if (!order.customer.phone || order.customer.phone.length < 10) {
    return next(new ErrorResponse("Valid customer phone number is required", 400));
  }

  try {
    // Initialize Sequel Logistics service
    const sequelService = new SequelLogisticsService();

    // Prepare order data for shipment
    const customerName = `${order.customer.firstName} ${order.customer.lastName || ''}`.trim();
    const customerPhone = order.customer.phone.replace(/\D/g, ''); // Remove non-digits

    // Calculate total weight from items (estimate if not available)
    const items = order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.grossWeightG || item.netGoldWeightG || 10, // Default 10g per item
    }));

    // Create shipment
    const shipmentResponse = await sequelService.createShipment({
      orderNumber: order.number,
      customerName: customerName,
      customerPhone: customerPhone,
      shippingAddress: {
        line1: order.shippingAddress.line1,
        line2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      totalAmount: order.totalAmount || order.pricing?.total || 0,
      items: items,
      // We don't provide COD, so codValue is not passed
    });

    if (shipmentResponse.status === 'false') {
      return next(
        new ErrorResponse(
          shipmentResponse.message || 'Failed to create shipment',
          400
        )
      );
    }

    // Update order with shipment details
    if (shipmentResponse.data) {
      order.shipping = {
        ...order.shipping,
        method: 'sequel247',
        carrier: 'Sequel Logistics',
        service: shipmentResponse.data.category_type || 'secure diamond & jewellery',
        trackingNumber: shipmentResponse.data.docketNumber,
        shippedAt: new Date(),
        eta: shipmentResponse.data.estimated_delivery || shipmentResponse.data.estimatedDelivery,
      };

      // Update legacy tracking fields
      order.trackingNumber = shipmentResponse.data.docketNumber;
      order.courierService = 'Sequel Logistics';

      // Update payment status to completed (we don't provide COD)
      if (order.payment) {
        order.payment.status = 'paid';
        // Ensure payment method is not 'cod' - set to a valid method if it was cod
        if (order.payment.method === 'cod') {
          // Set to a default valid method (use existing paymentMethod if valid, otherwise default to 'card')
          const validMethods = ['card', 'upi', 'bank_transfer', 'wallet', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI'];
          if (order.paymentMethod && validMethods.includes(order.paymentMethod)) {
            // Map legacy method to new format
            const methodMap: Record<string, string> = {
              'Credit Card': 'card',
              'Debit Card': 'card',
              'Net Banking': 'bank_transfer',
              'UPI': 'upi',
            };
            order.payment.method = methodMap[order.paymentMethod] || 'card';
          } else {
            order.payment.method = 'card'; // Default to card
          }
        }
      }
      
      // Clear or fix invalid paymentMethod (legacy field)
      if (order.paymentMethod === 'cod' || !order.paymentMethod) {
        // Set to a valid default based on payment.method if available
        if (order.payment?.method) {
          const methodMap: Record<string, string> = {
            'card': 'Credit Card',
            'Credit Card': 'Credit Card',
            'Debit Card': 'Debit Card',
            'upi': 'UPI',
            'UPI': 'UPI',
            'bank_transfer': 'Net Banking',
            'wallet': 'UPI',
          };
          order.paymentMethod = methodMap[order.payment.method] || 'Credit Card';
        } else {
          order.paymentMethod = 'Credit Card'; // Default valid value
        }
      }
      
      if (order.paymentStatus && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
      }

      // Update order status to shipped if not already
      if (order.status === 'pending' || order.status === 'confirmed') {
        order.status = 'shipped';
        order.orderStatus = 'shipped';
      }

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: 'shipped',
        date: new Date(),
        note: `Shipment created via Sequel Logistics. Docket: ${shipmentResponse.data.docketNumber}`,
      });

      // Add shipment metadata
      if (!order.metadata) {
        order.metadata = {};
      }
      order.metadata.sequelDocketNumber = shipmentResponse.data.docketNumber;
      order.metadata.sequelBRN = shipmentResponse.data.brn;
      order.metadata.sequelClientCode = shipmentResponse.data.client_code;
      if (shipmentResponse.data.docket_print) {
        order.metadata.sequelDocketPrint = shipmentResponse.data.docket_print;
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Shipment created successfully",
      data: {
        order,
        shipment: shipmentResponse.data,
      },
    });
  } catch (error: any) {
    console.error('Sequel Logistics API Error:', error);
    return next(
      new ErrorResponse(
        error.message || 'Failed to create shipment with Sequel Logistics',
        500
      )
    );
  }
});

