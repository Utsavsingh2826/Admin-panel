import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { asyncHandler } from '../middleware/asyncHandler';
import { ErrorResponse } from '../utils/errorResponse';
import { sendEmail } from '../utils/sendEmail';
import { AuthRequest, LoginCredentials, Verify2FABody, JwtPayload } from '../types';

// Generate JWT Token
const generateToken = (id: string): string => {
  const secret: string = process.env.JWT_SECRET || '';
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  // @ts-ignore - TypeScript type issue with jsonwebtoken, but works at runtime
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Send token response
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  const userId = typeof user._id === 'string' ? user._id : user._id.toString();
  const token = generateToken(userId);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
};

// @desc    Login user (Step 1: Email + Password)
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password }: LoginCredentials = req.body;

  // Validate
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Find user with password and 2FA code
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +twoFactorCode');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if active
  if (!user.isActive) {
    return next(new ErrorResponse('Account is deactivated', 401));
  }

  // Check if locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    return next(new ErrorResponse('Account is locked. Please try again later.', 401));
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Reset login attempts
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to user (expires in 10 minutes)
  user.twoFactorCode = otpCode;
  user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Login Verification Code - KYNA Admin',
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #14b8a6;">Login Verification Code</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested to log in to your KYNA Admin account.</p>
          <p style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 5px; text-align: center; margin: 30px 0; padding: 20px; background-color: #f0fdfa; border-radius: 8px;">
            ${otpCode}
          </p>
          <p>Enter this code to complete your login. This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please ignore this email or contact support.
          </p>
        </div>
      `,
    });

    // Generate temporary token for 2FA step
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new ErrorResponse('JWT_SECRET is not configured', 500));
    }
    const userId = typeof user._id === 'string' ? user._id : String(user._id);
    const tempToken = jwt.sign(
      { id: userId, step: '2fa_pending' },
      secret,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      requires2FA: true,
      tempToken: tempToken,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    // Clear the OTP if email fails
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Failed to send verification code. Please try again.', 500));
  }
});

// @desc    Verify 2FA code (Step 2: OTP Verification)
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tempToken, code }: Verify2FABody = req.body;

  if (!tempToken || !code) {
    return next(new ErrorResponse('Please provide token and verification code', 400));
  }

  // Verify temp token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new ErrorResponse('JWT_SECRET is not configured', 500));
  }
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(tempToken, secret) as JwtPayload;
    if (decoded.step !== '2fa_pending') {
      return next(new ErrorResponse('Invalid token', 401));
    }
  } catch (error) {
    return next(new ErrorResponse('Token expired or invalid', 401));
  }

  // Find user with 2FA code
  const user = await User.findById(decoded.id).select('+twoFactorCode');
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if code matches and not expired
  if (!user.twoFactorCode || user.twoFactorCode !== code) {
    return next(new ErrorResponse('Invalid verification code', 401));
  }

  if (!user.twoFactorCodeExpires || user.twoFactorCodeExpires < new Date()) {
    // Clear expired code
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Verification code expired. Please login again.', 401));
  }

  // Code is valid - clear it and complete login
  user.twoFactorCode = undefined;
  user.twoFactorCodeExpires = undefined;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Send full access token
  sendTokenResponse(user, 200, res);
});

// @desc    Resend 2FA code
// @route   POST /api/auth/resend-2fa
// @access  Public
export const resend2FA = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    return next(new ErrorResponse('Token required', 400));
  }

  // Verify temp token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new ErrorResponse('JWT_SECRET is not configured', 500));
  }
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(tempToken, secret) as JwtPayload;
    if (decoded.step !== '2fa_pending') {
      return next(new ErrorResponse('Invalid token', 401));
    }
  } catch (error) {
    return next(new ErrorResponse('Token expired. Please login again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Generate new OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.twoFactorCode = otpCode;
  user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Send new code
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Login Verification Code - KYNA Admin',
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #14b8a6;">New Verification Code</h2>
          <p>Hello ${user.name},</p>
          <p>Your new verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 5px; text-align: center; margin: 30px 0; padding: 20px; background-color: #f0fdfa; border-radius: 8px;">
            ${otpCode}
          </p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return next(new ErrorResponse('Failed to send code. Please try again.', 500));
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);

  res.status(200).json({
    success: true,
    user: {
      id: user!._id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      isActive: user!.isActive,
      lastLogin: user!.lastLogin,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

