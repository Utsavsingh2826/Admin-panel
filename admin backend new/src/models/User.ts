import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const AddressSchema = new Schema(
  {
    shippingAddress: {
      sameAsBilling: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
      index: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'staff', 'customer'],
      default: 'customer',
    },
    address: AddressSchema,
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    gifts: [Schema.Types.Mixed],
    isActive: {
      type: Boolean,
      default: true,
    },
    availableOffers: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    refDiscount: {
      type: Number,
      default: 0,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    totalReferralEarnings: {
      type: Number,
      default: 0,
    },
    usedPromoCodes: [Schema.Types.Mixed],
    usedReferralCodes: [Schema.Types.Mixed],
    lastLogin: {
      type: Schema.Types.Mixed, // Can be Number (timestamp) or Date
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined values
    },
    phone: {
      type: String,
      trim: true,
    },
    // Admin-specific fields (optional)
    twoFactorCode: {
      type: String,
      default: null,
      select: false,
    },
    twoFactorCodeExpires: {
      type: Date,
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'users', // Explicitly set collection name
  }
);

// Indexes (email index is already defined in schema with unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLockedVirtual').get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password (only if password is provided and modified)
userSchema.pre('save', async function (next) {
  // Only hash password if it's provided and modified, and user is not a customer without password
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Pre-save middleware to generate name from firstName and lastName if name is not provided
userSchema.pre('save', function (next) {
  if (!this.name && (this.firstName || this.lastName)) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  // Also set firstName/lastName from name if they don't exist
  if (this.name && !this.firstName && !this.lastName) {
    const nameParts = this.name.split(' ');
    this.firstName = nameParts[0] || '';
    this.lastName = nameParts.slice(1).join(' ') || '';
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
  }

  await this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Transform output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.twoFactorCode;
  delete userObject.twoFactorCodeExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Define static methods interface
interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const User = mongoose.model<IUser, UserModel>('User', userSchema);

// Static method helper
User.findByEmail = async function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export default User;

