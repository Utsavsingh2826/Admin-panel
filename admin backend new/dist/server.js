"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, database_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS configuration - Allow all localhost origins in development
const corsOptions = {
    origin: function (origin, callback) {
        // In development, allow all localhost origins
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
                return;
            }
        }
        // Production: use specific allowed origins
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
    });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
//# sourceMappingURL=server.js.map