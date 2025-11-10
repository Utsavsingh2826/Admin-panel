"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorResponse_1 = require("../utils/errorResponse");
const protect = async (req, _res, next) => {
    let token;
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
        return;
    }
    try {
        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            next(new errorResponse_1.ErrorResponse('JWT_SECRET is not configured', 500));
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Check if token is for 2FA step (should not be used for protected routes)
        if (decoded.step === '2fa_pending') {
            next(new errorResponse_1.ErrorResponse('Please complete 2FA verification', 401));
            return;
        }
        // Get user from token
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            next(new errorResponse_1.ErrorResponse('User not found', 404));
            return;
        }
        if (!user.isActive) {
            next(new errorResponse_1.ErrorResponse('Account is deactivated', 401));
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(new errorResponse_1.ErrorResponse('Not authorized to access this route', 401));
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.js.map