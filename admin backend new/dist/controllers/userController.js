"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.unlockUser = exports.toggleUserStatus = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const errorResponse_1 = require("../utils/errorResponse");
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Superadmin
exports.getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const role = req.query.role || '';
    // Build query
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    if (status) {
        if (status === 'locked') {
            query.$or = [
                { isLocked: true },
                { lockUntil: { $gt: new Date() } },
            ];
        }
        else if (status === 'active') {
            query.isActive = true;
            query.$or = [
                { isLocked: false },
                { lockUntil: { $lte: new Date() } },
                { lockUntil: null },
            ];
        }
        else if (status === 'inactive') {
            query.isActive = false;
        }
    }
    if (role) {
        query.role = role;
    }
    // Get users
    const users = await User_1.default.find(query)
        .select('-password -twoFactorCode -twoFactorCodeExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    // Get total count
    const total = await User_1.default.countDocuments(query);
    res.status(200).json({
        success: true,
        count: users.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: users,
    });
});
// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Superadmin
exports.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id).select('-password -twoFactorCode -twoFactorCodeExpires');
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: user,
    });
});
// @desc    Create user
// @route   POST /api/users
// @access  Private/Superadmin
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, email, password, role, isActive } = req.body;
    // Validate required fields
    if (!name || !email || !password) {
        return next(new errorResponse_1.ErrorResponse('Please provide name, email, and password', 400));
    }
    // Check if user exists
    const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return next(new errorResponse_1.ErrorResponse('User with this email already exists', 400));
    }
    // Validate role
    const validRoles = ['superadmin', 'admin', 'manager', 'staff'];
    if (role && !validRoles.includes(role)) {
        return next(new errorResponse_1.ErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400));
    }
    // Create user (password will be hashed by pre-save middleware)
    const user = await User_1.default.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'staff',
        isActive: isActive !== undefined ? isActive : true,
    });
    // Remove password from response
    const userResponse = user.toJSON();
    res.status(201).json({
        success: true,
        data: userResponse,
    });
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Superadmin
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { name, email, password, role, isActive } = req.body;
    let user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    // Prevent updating own role (optional security measure)
    const currentUserId = String(req.user._id);
    if (currentUserId === req.params.id && role && role !== user.role) {
        return next(new errorResponse_1.ErrorResponse('You cannot change your own role', 400));
    }
    // Check if email is being changed and if it's already taken
    if (email && email.toLowerCase() !== user.email) {
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return next(new errorResponse_1.ErrorResponse('User with this email already exists', 400));
        }
        user.email = email.toLowerCase();
    }
    // Update fields
    if (name)
        user.name = name;
    if (password)
        user.password = password; // Will be hashed by pre-save middleware
    if (role) {
        const validRoles = ['superadmin', 'admin', 'manager', 'staff'];
        if (!validRoles.includes(role)) {
            return next(new errorResponse_1.ErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400));
        }
        user.role = role;
    }
    if (isActive !== undefined)
        user.isActive = isActive;
    await user.save();
    // Remove password from response
    const userResponse = user.toJSON();
    res.status(200).json({
        success: true,
        data: userResponse,
    });
});
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    // Prevent deleting yourself
    const currentUserId = String(req.user._id);
    if (currentUserId === req.params.id) {
        return next(new errorResponse_1.ErrorResponse('You cannot delete your own account', 400));
    }
    await user.deleteOne();
    res.status(200).json({
        success: true,
        data: {},
        message: 'User deleted successfully',
    });
});
// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Superadmin
exports.toggleUserStatus = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    // Prevent deactivating yourself
    const currentUserId = String(req.user._id);
    if (currentUserId === req.params.id && user.isActive) {
        return next(new errorResponse_1.ErrorResponse('You cannot deactivate your own account', 400));
    }
    user.isActive = !user.isActive;
    await user.save();
    const userResponse = user.toJSON();
    res.status(200).json({
        success: true,
        data: userResponse,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    });
});
// @desc    Unlock user account
// @route   PATCH /api/users/:id/unlock
// @access  Private/Superadmin
exports.unlockUser = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    // Unlock account
    user.isLocked = false;
    user.lockUntil = null;
    user.loginAttempts = 0;
    await user.save();
    const userResponse = user.toJSON();
    res.status(200).json({
        success: true,
        data: userResponse,
        message: 'User account unlocked successfully',
    });
});
// @desc    Reset user password
// @route   PATCH /api/users/:id/reset-password
// @access  Private/Superadmin
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return next(new errorResponse_1.ErrorResponse('Password must be at least 6 characters', 400));
    }
    const user = await User_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorResponse_1.ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
    });
});
//# sourceMappingURL=userController.js.map