import { Request } from 'express';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export interface IUser extends Document {
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

export interface AuthRequest extends Request {
  user?: IUser;
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
  createdAt?: Date;
  updatedAt?: Date;
}

