"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // For development: ignore self-signed certificates
            // ⚠️ WARNING: Only use this in development, not production!
            rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
        },
    });
    const message = {
        from: `${process.env.EMAIL_FROM || 'KYNA Admin'} <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };
    await transporter.sendMail(message);
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map