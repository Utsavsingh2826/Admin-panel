import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IAddress {
  shippingAddress?: {
    sameAsBilling?: boolean;
  };
}

// Admin User Interface (for admin users only)
export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'manager' | 'staff';
  twoFactorCode?: string | null;
  twoFactorCodeExpires?: Date | null;
  isActive: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockUntil?: Date | null;
  lastLogin?: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// Customer User Interface (for customers only)
export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  password?: string;
  isVerified?: boolean;
  role: 'customer';
  address?: IAddress;
  orders?: mongoose.Types.ObjectId[];
  wishlist?: mongoose.Types.ObjectId[];
  gifts?: any[];
  isActive: boolean;
  availableOffers?: number;
  referredBy?: mongoose.Types.ObjectId | null;
  refDiscount?: number;
  referralCount?: number;
  totalReferralEarnings?: number;
  usedPromoCodes?: any[];
  usedReferralCodes?: any[];
  lastLogin?: number | Date | null;
  referralCode?: string;
  phone?: string;
}

export interface AuthRequest extends Request {
  user?: IAdminUser; // Admin users for authentication
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Verify2FABody {
  tempToken: string;
  code: string;
}

export interface JwtPayload {
  id: string;
  step?: string;
}

export interface IPromoCode extends Document {
  code: string;
  discountPercent: number;
  isActive: boolean;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDefaultValue extends Document {
  goldValue24PerGram?: number;
  silverPricePerGram?: number;
  platinumPricePerGram?: number;
  titaniumPricePerGram?: number;
  labourCostGold?: number;
  labourCostPlatinum?: number;
  labourCostSilver?: number;
  labourCostTitanium?: number;
  goldExpense?: number;
  silverExpense?: number;
  platinumExpense?: number;
  titaniumExpense?: number;
  gstValue?: number;
}

