import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authorize: (...roles: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorize.d.ts.map