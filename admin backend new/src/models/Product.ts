import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  variant?: string;
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  price: number;
  metal?: string;
  karat?: number;
  diamondShape?: string;
  diamondSize?: number;
  isGiftingAvailable?: boolean;
  isEngraving?: boolean;
  images?: {
    main?: string;
    sub?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    variant: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    metal: {
      type: String,
      trim: true,
    },
    karat: {
      type: Number,
      min: 0,
    },
    diamondShape: {
      type: String,
      trim: true,
    },
    diamondSize: {
      type: Number,
      min: 0,
    },
    isGiftingAvailable: {
      type: Boolean,
      default: false,
    },
    isEngraving: {
      type: Boolean,
      default: false,
    },
    images: {
      main: {
        type: String,
        trim: true,
      },
      sub: [{
        type: String,
        trim: true,
      }],
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

// Indexes for efficient queries
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sku: 1 });

const Product = mongoose.model<IProduct, Model<IProduct>>('Product', ProductSchema);

export default Product;



