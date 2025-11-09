import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest, JwtPayload } from '../types';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(new ErrorResponse('Not authorized to access this route', 401));
    return;
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next(new ErrorResponse('JWT_SECRET is not configured', 500));
      return;
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Check if token is for 2FA step (should not be used for protected routes)
    if (decoded.step === '2fa_pending') {
      next(new ErrorResponse('Please complete 2FA verification', 401));
      return;
    }

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      next(new ErrorResponse('User not found', 404));
      return;
    }

    if (!user.isActive) {
      next(new ErrorResponse('Account is deactivated', 401));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

