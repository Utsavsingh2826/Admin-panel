import mongoose, { Document, Schema } from "mongoose";

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  sameAsBilling?: boolean;
}

export interface IStatusHistory {
  status?: string;
  date?: number;
  note?: string;
}

export interface IPriceBreakdown {
  metalCost?: number;
  diamondCost?: number;
  labourCost?: number;
  expense?: number;
  gstPercent?: number;
  gstAmount?: number;
  totalBeforeGst?: number;
  totalWithGst?: number;
}

export interface IProductSpecs {
  modelSku?: string;
  variantSku?: string;
  variant?: string;
  title?: string;
  sellingPrice?: number;
}

export interface IProductDetails {
  jewelryType?: string;
  description?: string;
  isDirectPurchase?: boolean;
  product?: {
    modelSku?: string;
    title?: string;
    price?: number;
    priceBreakdown?: IPriceBreakdown;
  };
  customization?: {
    metalColor?: string;
    metalType?: string;
    goldKarat?: string;
    diamondShape?: string;
    diamondSize?: string;
    diamondOrigin?: string;
    ringSize?: string;
    engraving?: string;
    engravingImageUrl?: string;
    hasEngraving?: boolean;
  };
  diamondDetails?: {
    shape?: string;
    size?: string;
    origin?: string;
    carat?: string;
  };
  metalDetails?: {
    type?: string;
    color?: string;
    karat?: string;
  };
  ringDetails?: {
    size?: string;
  };
  engravingDetails?: {
    text?: string;
    imageUrl?: string;
    hasEngraving?: boolean;
  };
  priceBreakdown?: IPriceBreakdown;
  productSpecs?: IProductSpecs;
}

export interface IOrder extends Document {
  orderNumber: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  orderStatus?: string;
  orderType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal?: number;
  totalAmount?: number;
  shippingCharge?: number;
  gst?: number;
  items?: any[];
  images?: any[];
  statusHistory?: IStatusHistory[];
  trackingInfo?: {
    events?: any[];
    trackingHistory?: any[];
  };
  user?: Schema.Types.ObjectId;
  createdAt?: number;
  orderedAt?: number;
  updatedAt?: number;
  productDetails?: IProductDetails;
  transactionId?: string;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    sameAsBilling: Boolean,
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: String,
    date: Number,
    note: String,
  },
  { _id: false }
);

const PriceBreakdownSchema = new Schema<IPriceBreakdown>(
  {
    metalCost: Number,
    diamondCost: Number,
    labourCost: Number,
    expense: Number,
    gstPercent: Number,
    gstAmount: Number,
    totalBeforeGst: Number,
    totalWithGst: Number,
  },
  { _id: false }
);

const ProductSpecsSchema = new Schema<IProductSpecs>(
  {
    modelSku: String,
    variantSku: String,
    variant: String,
    title: String,
    sellingPrice: Number,
  },
  { _id: false }
);

const ProductDetailsSchema = new Schema<IProductDetails>(
  {
    jewelryType: String,
    description: String,
    isDirectPurchase: Boolean,
    product: {
      modelSku: String,
      title: String,
      price: Number,
      priceBreakdown: PriceBreakdownSchema,
    },
    customization: {
      metalColor: String,
      metalType: String,
      goldKarat: String,
      diamondShape: String,
      diamondSize: String,
      diamondOrigin: String,
      ringSize: String,
      engraving: String,
      engravingImageUrl: String,
      hasEngraving: Boolean,
    },
    diamondDetails: {
      shape: String,
      size: String,
      origin: String,
      carat: String,
    },
    metalDetails: {
      type: String,
      color: String,
      karat: String,
    },
    ringDetails: {
      size: String,
    },
    engravingDetails: {
      text: String,
      imageUrl: String,
      hasEngraving: Boolean,
    },
    priceBreakdown: PriceBreakdownSchema,
    productSpecs: ProductSpecsSchema,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: String,
    billingAddress: AddressSchema,
    shippingAddress: AddressSchema,
    orderStatus: String,
    orderType: String,
    paymentMethod: String,
    paymentStatus: String,
    subtotal: Number,
    totalAmount: Number,
    shippingCharge: Number,
    gst: Number,
    items: {
      type: Array,
      default: [],
    },
    images: {
      type: Array,
      default: [],
    },
    statusHistory: [StatusHistorySchema],
    trackingInfo: {
      events: {
        type: Array,
        default: [],
      },
      trackingHistory: {
        type: Array,
        default: [],
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: Number,
    orderedAt: Number,
    updatedAt: Number,
    productDetails: ProductDetailsSchema,
    transactionId: String,
  },
  { timestamps: false }
);

export default mongoose.model<IOrder>("Order", OrderSchema);

