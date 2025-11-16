import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

// Type definitions
type Currency = "INR" | "USD" | "EUR";
type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready_for_dispatch"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
type PaymentStatus = "pending" | "authorized" | "paid" | "refunded" | "failed";
type FulfillmentStatus =
  | "pending"
  | "in_production"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";
type ProductType =
  | "ring"
  | "earrings"
  | "pendant"
  | "bracelet"
  | "necklace"
  | "bangle"
  | "band"
  | "custom";
type EarringSubtype = "studs" | "hoops/huggies" | "fashion earrings" | "drop earrings";
type StoneType = "natural diamond" | "lab-grown diamond" | "moissanite" | "cz" | "gemstone";
type StoneShape =
  | ""
  | "round"
  | "oval"
  | "princess"
  | "emerald"
  | "cushion"
  | "marquise"
  | "pear"
  | "heart"
  | "radiant"
  | "asscher";

// Order interface
export interface IOrder extends Document {
  // Order identifiers
  id?: string;
  number: string;
  
  // Customer information
  user: Schema.Types.ObjectId | IUser;
  customer: {
    id?: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName?: string;
  };
  
  // Order status
  status: OrderStatus;
  orderStatus: OrderStatus; // Legacy field for compatibility
  orderType: 'normal' | 'customized';
  
  // Order items
  items: Array<{
    lineId: string;
    productId?: string;
    sku?: string;
    name: string;
    productType: ProductType;
    category: "rings" | "earrings" | "pendants" | "bracelets" | "necklaces" | "bangles" | "bands" | "custom";
    category1: string;
    category2: string;
    category3: string;
    centerStoneShape: StoneShape;
    quantity: number;
    unitPrice: {
      currency: Currency;
      amount: number;
    };
    metal?: {
      material: "gold" | "platinum" | "silver";
      color?: "yellow" | "white" | "rose";
      karat?: "14K" | "18K" | "22K" | "925" | "950";
      finish?: "high-polish" | "matte" | "satin" | "mixed";
    };
    centerStone?: {
      type: StoneType;
      shape: StoneShape;
      carat?: number;
      color?: string;
      clarity?: string;
      cut?: string;
      certifiedBy?: string;
      certificateNo?: string;
    };
    sideStones?: Array<{
      type: StoneType;
      shape: StoneShape;
      carat?: number;
      color?: string;
      clarity?: string;
    }>;
    dimensions?: {
      ringSize?: string;
      braceletLengthMM?: number;
      bangleSize?: string;
      chainLengthIn?: number;
      pendantBailSizeMM?: number;
      earringSubtype?: EarringSubtype;
    };
    customization?: {
      engraving?: {
        text: string;
        font?: string;
        position?: string;
        language?: string;
      };
      uploadedDesignId?: string;
      buildConfigId?: string;
      notes?: string;
    };
    compliance?: {
      hallmark?: boolean;
      bisNumber?: string;
    };
    grossWeightG?: number;
    netGoldWeightG?: number;
    fulfillment?: {
      status: FulfillmentStatus;
      warehouseId?: string;
      serialNumber?: string;
      producedAt?: Date;
      readyAt?: Date;
    };
    images?: string[];
    lineTotals: {
      subtotal: {
        currency: Currency;
        amount: number;
      };
      discount?: {
        currency: Currency;
        amount: number;
      };
      tax?: {
        currency: Currency;
        amount: number;
      };
      total: {
        currency: Currency;
        amount: number;
      };
    };
    // Legacy fields for compatibility
    product?: Schema.Types.ObjectId;
    productModel?: "Pendant" | "Earring" | "Bracelet" | "Ring";
    price?: number;
    total?: number;
  }>;
  
  // Addresses
  shippingAddress: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    // Legacy fields
    companyName?: string;
    street?: string;
    zipCode?: string;
    sameAsBilling?: boolean;
  };
  
  billingAddress: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    // Legacy fields
    companyName?: string;
    street?: string;
    zipCode?: string;
  };
  
  // Pricing
  pricing: {
    currency: Currency;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  // Legacy pricing fields
  subtotal: number;
  gst: number;
  shippingCharge: number;
  totalAmount: number;
  
  // Payment
  payment: {
    method: "card" | "upi" | "cod" | "bank_transfer" | "wallet" | "Credit Card" | "Debit Card" | "Net Banking";
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: Date;
  };
  // Legacy payment fields
  paymentMethod?: "Credit Card" | "Debit Card" | "Net Banking" | "UPI";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string;
  ccavenueOrderId?: string;
  paymentGatewayResponse?: Record<string, any>;
  redirectUrls?: {
    success: string;
    failure: string;
    cancel: string;
  };
  
  // Shipping
  shipping: {
    method?: string;
    carrier?: string;
    service?: string;
    trackingNumber?: string;
    shippedAt?: Date;
    eta?: string;
  };
  // Legacy shipping fields
  trackingNumber?: string;
  courierService?: string;
  trackingInfo?: {
    docketNumber?: string;
    status?: string;
    lastUpdated?: Date;
    estimatedDelivery?: string;
    hasTracking?: boolean;
    error?: string;
    trackingHistory?: any[];
    events?: Array<{
      status: string;
      timestamp: Date;
      location?: string;
      note?: string;
    }>;
  };
  
  // Status history
  statusHistory?: Array<{
    status: string;
    date: Date;
    note?: string;
  }>;
  
  // Images
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt?: Date;
    source?: string;
    alt?: string;
  }>;
  
  // Additional fields
  notes?: string;
  tags?: string[];
  metadata?: Record<string, string | number | boolean>;
  estimatedDeliveryDate?: Date;
  
  // Timeline
  orderedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    number: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    customer: {
      id: { type: String },
      email: { type: String, required: true },
      phone: { type: String },
      firstName: { type: String, required: true },
      lastName: { type: String }
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_production", "ready_for_dispatch", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
      index: true
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    orderType: {
      type: String,
      enum: ['normal', 'customized'],
      default: 'normal'
    },
    items: [{
      lineId: { type: String, required: true },
      productId: { type: String },
      sku: { type: String },
      name: { type: String, required: true },
      productType: {
        type: String,
        enum: ["ring", "earrings", "pendant", "bracelet", "necklace", "bangle", "band", "custom"],
        required: true
      },
      category: {
        type: String,
        enum: ["rings", "earrings", "pendants", "bracelets", "necklaces", "bangles", "bands", "custom"],
        required: true
      },
      category1: { type: String, default: "" },
      category2: { type: String, default: "" },
      category3: { type: String, default: "" },
      centerStoneShape: { type: String, default: "" },
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: {
        currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
        amount: { type: Number, required: true }
      },
      metal: {
        material: { type: String, enum: ["gold", "platinum", "silver"] },
        color: { type: String, enum: ["yellow", "white", "rose"] },
        karat: { type: String, enum: ["14K", "18K", "22K", "925", "950"] },
        finish: { type: String, enum: ["high-polish", "matte", "satin", "mixed"] }
      },
      centerStone: {
        type: { type: String },
        shape: { type: String },
        carat: { type: Number },
        color: { type: String },
        clarity: { type: String },
        cut: { type: String },
        certifiedBy: { type: String },
        certificateNo: { type: String }
      },
      sideStones: [{
        type: { type: String },
        shape: { type: String },
        carat: { type: Number },
        color: { type: String },
        clarity: { type: String }
      }],
      dimensions: {
        ringSize: { type: String },
        braceletLengthMM: { type: Number },
        bangleSize: { type: String },
        chainLengthIn: { type: Number },
        pendantBailSizeMM: { type: Number },
        earringSubtype: { type: String, enum: ["studs", "hoops/huggies", "fashion earrings", "drop earrings"] }
      },
      customization: {
        engraving: {
          text: { type: String },
          font: { type: String },
          position: { type: String },
          language: { type: String }
        },
        uploadedDesignId: { type: String },
        buildConfigId: { type: String },
        notes: { type: String }
      },
      compliance: {
        hallmark: { type: Boolean },
        bisNumber: { type: String }
      },
      grossWeightG: { type: Number },
      netGoldWeightG: { type: Number },
      fulfillment: {
        status: {
          type: String,
          enum: ["pending", "in_production", "ready", "shipped", "delivered", "cancelled"]
        },
        warehouseId: { type: String },
        serialNumber: { type: String },
        producedAt: { type: Date },
        readyAt: { type: Date }
      },
      images: [{ type: String }],
      lineTotals: {
        subtotal: {
          currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
          amount: { type: Number, required: true }
        },
        discount: {
          currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
          amount: { type: Number }
        },
        tax: {
          currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
          amount: { type: Number }
        },
        total: {
          currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
          amount: { type: Number, required: true }
        }
      },
      // Legacy fields
      product: { type: Schema.Types.ObjectId, refPath: "items.productModel" },
      productModel: { type: String, enum: ["Pendant", "Earring", "Bracelet", "Ring"] },
      price: { type: Number },
      total: { type: Number }
    }],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      // Legacy fields
      companyName: { type: String },
      street: { type: String },
      zipCode: { type: String },
      sameAsBilling: { type: Boolean, default: false }
    },
    billingAddress: {
      name: { type: String, required: true },
      phone: { type: String },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      // Legacy fields
      companyName: { type: String },
      street: { type: String },
      zipCode: { type: String }
    },
    pricing: {
      currency: { type: String, enum: ["INR", "USD", "EUR"], default: "INR" },
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    // Legacy pricing fields
    subtotal: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    payment: {
      method: {
        type: String,
        enum: ["card", "upi", "cod", "bank_transfer", "wallet", "Credit Card", "Debit Card", "Net Banking", "UPI"],
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "authorized", "paid", "refunded", "failed"],
        default: "pending"
      },
      transactionId: { type: String },
      paidAt: { type: Date }
    },
    // Legacy payment fields
    paymentMethod: { type: String, enum: ["Credit Card", "Debit Card", "Net Banking", "UPI"], default: "Credit Card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    transactionId: { type: String },
    ccavenueOrderId: { type: String },
    paymentGatewayResponse: { type: Schema.Types.Mixed },
    redirectUrls: {
      success: { type: String },
      failure: { type: String },
      cancel: { type: String }
    },
    shipping: {
      method: { type: String },
      carrier: { type: String },
      service: { type: String },
      trackingNumber: { type: String },
      shippedAt: { type: Date },
      eta: { type: String }
    },
    // Legacy shipping fields
    trackingNumber: { type: String },
    courierService: { type: String },
    trackingInfo: {
      docketNumber: { type: String },
      status: { type: String },
      lastUpdated: { type: Date },
      estimatedDelivery: { type: String },
      hasTracking: { type: Boolean },
      error: { type: String },
      trackingHistory: [{ type: Schema.Types.Mixed }],
      events: [{
        status: { type: String },
        timestamp: { type: Date },
        location: { type: String },
        note: { type: String }
      }]
    },
    statusHistory: [{
      status: { type: String, required: true },
      date: { type: Date, required: true },
      note: { type: String }
    }],
    images: [{
      url: { type: String, required: true },
      publicId: { type: String },
      uploadedAt: { type: Date },
      source: { type: String },
      alt: { type: String }
    }],
    notes: { type: String },
    tags: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
    estimatedDeliveryDate: { type: Date },
    orderedAt: { type: Date, default: Date.now },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    returnedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Indexes
orderSchema.index({ user: 1, orderedAt: -1 });
// Note: number field already has unique: true which creates an index
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "customer.email": 1 });

// Pre-save hook to generate order number
orderSchema.pre('save', function(next) {
  if (!this.number) {
    this.number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  // Sync legacy fields
  if (this.pricing) {
    this.subtotal = this.pricing.subtotal;
    this.gst = this.pricing.tax;
    this.shippingCharge = this.pricing.shipping;
    this.totalAmount = this.pricing.total;
  }
  if (this.payment) {
    // Only sync paymentMethod if it's a valid enum value for legacy field
    const validLegacyMethods = ["Credit Card", "Debit Card", "Net Banking", "UPI"];
    const paymentMethodMap: Record<string, string> = {
      "card": "Credit Card",
      "Credit Card": "Credit Card",
      "Debit Card": "Debit Card",
      "Net Banking": "Net Banking",
      "upi": "UPI",
      "UPI": "UPI",
      "bank_transfer": "Net Banking",
      "wallet": "UPI",
    };
    
    // If payment.method is valid, sync it to paymentMethod
    if (this.payment.method && paymentMethodMap[this.payment.method]) {
      this.paymentMethod = paymentMethodMap[this.payment.method] as any;
    } else if (this.payment.method === 'cod' || !this.paymentMethod || !validLegacyMethods.includes(this.paymentMethod)) {
      // If payment.method is 'cod' or paymentMethod is invalid, set to default
      this.paymentMethod = "Credit Card";
      // Also fix payment.method if it's 'cod'
      if (this.payment.method === 'cod') {
        this.payment.method = 'card';
      }
    }
    // If paymentMethod is already valid, keep it as is
    
    this.paymentStatus = this.payment.status as any;
    this.transactionId = this.payment.transactionId;
  } else if (!this.paymentMethod || !["Credit Card", "Debit Card", "Net Banking", "UPI"].includes(this.paymentMethod)) {
    // If no payment object but paymentMethod is invalid, set default
    this.paymentMethod = "Credit Card";
  }
  if (this.shipping) {
    this.trackingNumber = this.shipping.trackingNumber;
  }
  if (!this.orderStatus) {
    this.orderStatus = this.status as any;
  }
  next();
});

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export { OrderModel };
export default OrderModel;

