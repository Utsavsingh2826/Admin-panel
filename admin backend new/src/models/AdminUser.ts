import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IAdminUser } from '../types';

const adminUserSchema = new Schema<IAdminUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'manager', 'staff'],
      default: 'staff',
      required: true,
    },
    twoFactorCode: {
      type: String,
      default: null,
      select: false,
    },
    twoFactorCodeExpires: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
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
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'adminusers', // Explicit collection name for admin users
  }
);

// Indexes (email index is already defined in schema with unique: true)
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ isActive: 1 });

// Virtual for account lock status
adminUserSchema.virtual('isLockedVirtual').get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
adminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to check password
adminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to increment login attempts
adminUserSchema.methods.incLoginAttempts = async function (): Promise<void> {
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
adminUserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  await this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Transform output
adminUserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.twoFactorCode;
  delete userObject.twoFactorCodeExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

// Define static methods interface
interface AdminUserModel extends Model<IAdminUser> {
  findByEmail(email: string): Promise<IAdminUser | null>;
}

const AdminUser = mongoose.model<IAdminUser, AdminUserModel>('AdminUser', adminUserSchema);

// Static method helper
AdminUser.findByEmail = async function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export default AdminUser;


