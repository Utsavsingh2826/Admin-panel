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

  // Populate user to get customer information
  await order.populate('user');
  
  // Check if shipment already exists (check trackingInfo and metadata)
  const existingDocket = order.trackingInfo?.events?.find((e: any) => e.docketNumber)?.docketNumber ||
                         (order as any).metadata?.sequelDocketNumber;
  
  if (existingDocket) {
    return next(new ErrorResponse("Shipment already created for this order. Docket Number: " + existingDocket, 400));
  }

  // Validate required fields
  if (!order.shippingAddress) {
    return next(new ErrorResponse("Shipping address is missing", 400));
  }

  if (!order.user || typeof order.user === 'string') {
    return next(new ErrorResponse("Customer information is missing", 400));
  }

  // Get customer info from populated user
  const user = order.user as any;
  if (!user.email) {
    return next(new ErrorResponse("Customer email is missing", 400));
  }

  if (!order.shippingAddress.zipCode || order.shippingAddress.zipCode.length !== 6) {
    return next(new ErrorResponse("Invalid zip code (must be 6 digits)", 400));
  }

  // Try to get phone from user or use a default
  const customerPhone = (user.phone || '').replace(/\D/g, '');
  if (customerPhone.length < 10) {
    return next(new ErrorResponse("Valid customer phone number is required", 400));
  }

  try {
    // Get customer name
    const customerName = user.name || user.firstName || user.email?.split('@')[0] || 'Customer';

    // Log order details before creating shipment
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 CREATING SHIPMENT FOR ORDER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Order Number:', order.orderNumber);
    console.log('Order ID:', order._id);
    console.log('Customer:', customerName);
    console.log('Customer Email:', user.email);
    console.log('Customer Phone:', customerPhone);
    console.log('Total Amount:', order.totalAmount || 0);
    console.log('Shipping Address:', order.shippingAddress);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialize Sequel Logistics service
    const sequelService = new SequelLogisticsService();

    // Calculate total weight from items (estimate if not available)
    const items = (order.items || []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.grossWeightG || item.netGoldWeightG || 10, // Default 10g per item
    }));

    // Log prepared shipment data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 PREPARED SHIPMENT DATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Customer Name:', customerName);
    console.log('Customer Phone:', customerPhone);
    console.log('Items:', JSON.stringify(items, null, 2));
    console.log('Total Weight (estimated):', items.reduce((sum, item) => sum + item.weight * item.quantity, 0), 'grams');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create shipment - map address fields from schema (street, zipCode) to service format (line1, postalCode)
    const shipmentResponse = await sequelService.createShipment({
      orderNumber: order.orderNumber,
      customerName: customerName,
      customerPhone: customerPhone,
      shippingAddress: {
        line1: order.shippingAddress.street || '',
        line2: '', // Not in new schema, use empty string
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        postalCode: order.shippingAddress.zipCode || '',
        country: order.shippingAddress.country || 'India',
      },
      totalAmount: order.totalAmount || 0,
      items: items,
      // We don't provide COD, so codValue is not passed
    });

    // Log shipment response
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 SHIPMENT RESPONSE RECEIVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Status:', shipmentResponse.status);
    console.log('Message:', shipmentResponse.message);
    
    // Extract docket number once - Sequel API uses docket_number (snake_case)
    const docketNumber = shipmentResponse.data?.docket_number || shipmentResponse.data?.docketNumber;
    
    if (shipmentResponse.data) {
      console.log('Docket Number:', docketNumber);
      console.log('BRN:', shipmentResponse.data.brn);
      console.log('Estimated Delivery:', shipmentResponse.data.estimated_delivery || shipmentResponse.data.estiimated_delivery);
      console.log('Full Response Data:', JSON.stringify(shipmentResponse.data, null, 2));
    }
    if (shipmentResponse.errorInfo) {
      console.log('Error Info:', JSON.stringify(shipmentResponse.errorInfo, null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (shipmentResponse.status === 'false') {
      console.error('❌ Shipment creation failed:', shipmentResponse.message);
      return next(
        new ErrorResponse(
          shipmentResponse.message || 'Failed to create shipment',
          400
        )
      );
    }

    // Update order with shipment details
    if (shipmentResponse.data) {
      if (!docketNumber) {
        console.error('⚠️ Warning: No docket number in Sequel response:', shipmentResponse.data);
      }

      // Initialize trackingInfo if it doesn't exist
      if (!order.trackingInfo) {
        order.trackingInfo = { events: [], trackingHistory: [] };
      }
      if (!order.trackingInfo.events) {
        order.trackingInfo.events = [];
      }
      if (!order.trackingInfo.trackingHistory) {
        order.trackingInfo.trackingHistory = [];
      }

      // Add tracking event with docket number
      const trackingEvent = {
        docketNumber: docketNumber || '',
        status: 'shipped',
        date: Date.now(),
        carrier: 'Sequel Logistics',
        service: shipmentResponse.data.category_type || 'secure diamond & jewellery',
        estimatedDelivery: shipmentResponse.data.estimated_delivery || shipmentResponse.data.estiimated_delivery || '',
        note: `Shipment created via Sequel Logistics. Docket: ${docketNumber || 'N/A'}`,
      };
      
      order.trackingInfo.events.push(trackingEvent);
      order.trackingInfo.trackingHistory.push(trackingEvent);

      // Update payment status to paid (we don't provide COD)
      if (order.paymentMethod === 'cod' || !order.paymentMethod) {
        // Set to a valid default (Credit Card)
        order.paymentMethod = 'Credit Card';
      }
      
      if (order.paymentStatus && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
      }

      // Update order status to shipped if not already
      if (order.orderStatus === 'pending' || order.orderStatus === 'confirmed') {
        order.orderStatus = 'shipped';
      }

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: 'shipped',
        date: Date.now(), // Use timestamp (number) instead of Date object
        note: `Shipment created via Sequel Logistics. Docket: ${docketNumber || 'N/A'}`,
      });

      // Store shipment metadata in a way that's accessible
      // Since metadata is not in the schema, we'll store it in trackingInfo
      (order.trackingInfo as any).metadata = {
        sequelDocketNumber: docketNumber,
        sequelBRN: shipmentResponse.data.brn,
        sequelClientCode: shipmentResponse.data.client_code,
        sequelDocketPrint: shipmentResponse.data.docket_print || null,
      };
      
      // Log the docket number being saved
      console.log('💾 Saving docket number to order:', docketNumber);

      await order.save();
      
      // Log successful order update
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ ORDER UPDATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Order Number:', order.orderNumber);
      console.log('Docket Number:', docketNumber);
      console.log('Payment Status:', order.paymentStatus);
      console.log('Order Status:', order.orderStatus);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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

// @desc    Track a shipment by docket number
// @route   POST /api/orders/track
// @access  Private (Admin, Superadmin)
export const trackShipment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { docketNumber } = req.body;

  if (!docketNumber) {
    return next(new ErrorResponse("Docket number is required", 400));
  }

  // Validate docket number format (10 digits)
  if (docketNumber.length !== 10 || !/^\d+$/.test(docketNumber)) {
    return next(new ErrorResponse("Docket number must be exactly 10 digits", 400));
  }

  try {
    // Initialize Sequel Logistics service
    const sequelService = new SequelLogisticsService();

    // Track the docket
    const trackingResponse = await sequelService.trackDocket(docketNumber);

    if (trackingResponse.status === 'false') {
      return next(
        new ErrorResponse(
          trackingResponse.message || 'Failed to track shipment',
          400
        )
      );
    }

    res.status(200).json({
      success: true,
      message: "Tracking information retrieved successfully",
      data: trackingResponse.data || trackingResponse,
    });
  } catch (error: any) {
    console.error('Sequel Logistics Tracking Error:', error);
    return next(
      new ErrorResponse(
        error.message || 'Failed to track shipment with Sequel Logistics',
        500
      )
    );
  }
});

// @desc    Track multiple shipments by docket numbers
// @route   POST /api/orders/track-multiple
// @access  Private (Admin, Superadmin)
export const trackMultipleShipments = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { docketNumbers } = req.body;

  if (!docketNumbers || !Array.isArray(docketNumbers) || docketNumbers.length === 0) {
    return next(new ErrorResponse("Docket numbers array is required", 400));
  }

  // Validate all docket numbers (must be 10 digits each)
  const invalidDockets = docketNumbers.filter((docket: string) => 
    typeof docket !== 'string' || docket.length !== 10 || !/^\d+$/.test(docket)
  );

  if (invalidDockets.length > 0) {
    return next(new ErrorResponse(`Invalid docket numbers (must be 10 digits): ${invalidDockets.join(', ')}`, 400));
  }

  try {
    // Initialize Sequel Logistics service
    const sequelService = new SequelLogisticsService();

    // Track the dockets
    const trackingResponse = await sequelService.trackMultipleDockets(docketNumbers);

    res.status(200).json({
      success: true,
      message: "Tracking information retrieved successfully",
      data: trackingResponse,
    });
  } catch (error: any) {
    console.error('Sequel Logistics Multiple Tracking Error:', error);
    return next(
      new ErrorResponse(
        error.message || 'Failed to track shipments with Sequel Logistics',
        500
      )
    );
  }
});

