"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponse = void 0;
class ErrorResponse extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ErrorResponse = ErrorResponse;
//# sourceMappingURL=errorResponse.js.map