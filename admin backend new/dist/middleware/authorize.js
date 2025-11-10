"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const errorResponse_1 = require("../utils/errorResponse");
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorResponse_1.ErrorResponse('Not authorized', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorResponse_1.ErrorResponse(`User role '${req.user.role}' is not authorized to access this route`, 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authorize.js.map