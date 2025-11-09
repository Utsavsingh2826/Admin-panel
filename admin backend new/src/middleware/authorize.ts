import { Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';
import { AuthRequest } from '../types';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

