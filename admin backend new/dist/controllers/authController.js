"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.resend2FA = exports.verify2FA = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorResponse_1 = require("../utils/errorResponse");
const sendEmail_1 = require("../utils/sendEmail");
// Generate JWT Token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || '';
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    // @ts-ignore - TypeScript type issue with jsonwebtoken, but works at runtime
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};
// Send token response
const sendTokenResponse = (user, statusCode, res) => {
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
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { email, password } = req.body;
    // Validate
    if (!email || !password) {
        return next(new errorResponse_1.ErrorResponse('Please provide email and password', 400));
    }
    // Find user with password and 2FA code
    const user = await User_1.default.findOne({ email: email.toLowerCase() })
        .select('+password +twoFactorCode');
    if (!user) {
        return next(new errorResponse_1.ErrorResponse('Invalid credentials', 401));
    }
    // Check if active
    if (!user.isActive) {
        return next(new errorResponse_1.ErrorResponse('Account is deactivated', 401));
    }
    // Check if locked
    if (user.lockUntil && user.lockUntil > new Date()) {
        return next(new errorResponse_1.ErrorResponse('Account is locked. Please try again later.', 401));
    }
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await user.incLoginAttempts();
        return next(new errorResponse_1.ErrorResponse('Invalid credentials', 401));
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
        await (0, sendEmail_1.sendEmail)({
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
            return next(new errorResponse_1.ErrorResponse('JWT_SECRET is not configured', 500));
        }
        const userId = typeof user._id === 'string' ? user._id : String(user._id);
        const tempToken = jsonwebtoken_1.default.sign({ id: userId, step: '2fa_pending' }, secret, { expiresIn: '10m' });
        res.status(200).json({
            success: true,
            requires2FA: true,
            tempToken: tempToken,
            message: 'Verification code sent to your email',
        });
    }
    catch (error) {
        console.error('Email sending failed:', error);
        // Clear the OTP if email fails
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorResponse_1.ErrorResponse('Failed to send verification code. Please try again.', 500));
    }
});
// @desc    Verify 2FA code (Step 2: OTP Verification)
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
        return next(new errorResponse_1.ErrorResponse('Please provide token and verification code', 400));
    }
    // Verify temp token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new errorResponse_1.ErrorResponse('JWT_SECRET is not configured', 500));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(tempToken, secret);
        if (decoded.step !== '2fa_pending') {
            return next(new errorResponse_1.ErrorResponse('Invalid token', 401));
        }
    }
    catch (error) {
        return next(new errorResponse_1.ErrorResponse('Token expired or invalid', 401));
    }
    // Find user with 2FA code
    const user = await User_1.default.findById(decoded.id).select('+twoFactorCode');
    if (!user) {
        return next(new errorResponse_1.ErrorResponse('User not found', 404));
    }
    // Check if code matches and not expired
    if (!user.twoFactorCode || user.twoFactorCode !== code) {
        return next(new errorResponse_1.ErrorResponse('Invalid verification code', 401));
    }
    if (!user.twoFactorCodeExpires || user.twoFactorCodeExpires < new Date()) {
        // Clear expired code
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorResponse_1.ErrorResponse('Verification code expired. Please login again.', 401));
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
exports.resend2FA = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { tempToken } = req.body;
    if (!tempToken) {
        return next(new errorResponse_1.ErrorResponse('Token required', 400));
    }
    // Verify temp token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return next(new errorResponse_1.ErrorResponse('JWT_SECRET is not configured', 500));
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(tempToken, secret);
        if (decoded.step !== '2fa_pending') {
            return next(new errorResponse_1.ErrorResponse('Invalid token', 401));
        }
    }
    catch (error) {
        return next(new errorResponse_1.ErrorResponse('Token expired. Please login again.', 401));
    }
    const user = await User_1.default.findById(decoded.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse('User not found', 404));
    }
    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = otpCode;
    user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    // Send new code
    try {
        await (0, sendEmail_1.sendEmail)({
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
    }
    catch (error) {
        console.error('Email sending failed:', error);
        return next(new errorResponse_1.ErrorResponse('Failed to send code. Please try again.', 500));
    }
});
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
        },
    });
});
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
});
//# sourceMappingURL=authController.js.map