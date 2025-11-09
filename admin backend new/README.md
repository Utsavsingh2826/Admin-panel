# Jewelry Admin Backend API

TypeScript backend API for the Jewelry Admin Dashboard with email-based 2FA authentication.

## 🚀 Features

- ✅ **TypeScript** for type safety and better development experience
- ✅ **Email-based 2FA** authentication (6-digit OTP sent via email)
- ✅ **Role-based access control** (superadmin, admin, manager, staff)
- ✅ **JWT token authentication** with secure token management
- ✅ **Account security** with login attempt tracking and account lockout
- ✅ **MongoDB** with Mongoose for data persistence
- ✅ **Express.js** RESTful API architecture
- ✅ **Error handling** with centralized error middleware
- ✅ **CORS** enabled for frontend integration

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** (local or cloud instance)
- **Email account** (Gmail recommended) for sending OTP codes

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (copy from `env.example`):

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/jewelry-admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=30d

# Email Configuration (for 2FA and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kynajewels.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Email Setup (Gmail)

For Gmail, you need to use an **App Password**:

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this 16-character password in `EMAIL_PASS`

### 4. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 5. Seed Superadmin User

Create the initial superadmin user:

```bash
npm run seed
```

This creates a superadmin user with:
- **Email**: `utsavsingh2826@gmail.com`
- **Password**: `Utsav@1234`
- **Role**: `superadmin`

## 🚦 Running the Server

### Development Mode

```bash
npm run dev
```

Server runs on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

#### 1. Login (Step 1: Email + Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "utsavsingh2826@gmail.com",
  "password": "Utsav@1234"
}
```

**Response:**
```json
{
  "success": true,
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Verification code sent to your email"
}
```

**What happens:**
- Password is verified
- 6-digit OTP is generated and sent to email
- Temporary token is returned (expires in 10 minutes)

#### 2. Verify 2FA (Step 2: OTP Verification)
```http
POST /api/auth/verify-2fa
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6581b234567890123456",
    "name": "Utsav",
    "email": "utsavsingh2826@gmail.com",
    "role": "superadmin",
    "isActive": true
  }
}
```

**What happens:**
- Temporary token is verified
- OTP code is validated
- Full access token is generated (expires in 7 days)
- User info is returned

#### 3. Resend 2FA Code
```http
POST /api/auth/resend-2fa
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "New verification code sent to your email"
}
```

#### 4. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "6581b234567890123456",
    "name": "Utsav",
    "email": "utsavsingh2826@gmail.com",
    "role": "superadmin",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 5. Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

## 🔐 Authentication Flow

### Complete Login Process

1. **User submits credentials**
   ```
   POST /api/auth/login
   { email, password }
   ```

2. **Backend validates and sends OTP**
   - Verifies email and password
   - Generates 6-digit OTP
   - Sends OTP via email
   - Returns temporary token

3. **User receives email**
   - Check email inbox
   - Find email: "Your Login Verification Code - KYNA Admin"
   - Copy the 6-digit code

4. **User verifies OTP**
   ```
   POST /api/auth/verify-2fa
   { tempToken, code }
   ```

5. **Backend returns access token**
   - Validates OTP code
   - Generates JWT access token
   - Returns user information

6. **Use protected routes**
   ```
   GET /api/auth/me
   Authorization: Bearer <token>
   ```

## 📁 Project Structure

```
admin backend new/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   └── authController.ts    # Authentication logic
│   ├── middleware/
│   │   ├── asyncHandler.ts      # Async error wrapper
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.ts      # Global error handler
│   ├── models/
│   │   └── User.ts              # User schema and model
│   ├── routes/
│   │   └── auth.ts              # Authentication routes
│   ├── scripts/
│   │   ├── seedSuperAdmin.ts    # Seed superadmin user
│   │   └── createTestUser.ts    # Create test user
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   ├── errorResponse.ts   # Error response class
│   │   └── sendEmail.ts        # Email sending utility
│   └── server.ts                # Express server setup
├── .env                         # Environment variables (create from env.example)
├── env.example                  # Environment variables template
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 👤 User Schema

```typescript
{
  name: string;                    // User's full name
  email: string;                   // Unique email address
  password: string;                // Hashed password (bcrypt)
  role: 'superadmin' | 'admin' | 'manager' | 'staff';
  twoFactorCode: string;           // Temporary OTP code
  twoFactorCodeExpires: Date;      // OTP expiration time
  isActive: boolean;               // Account active status
  isLocked: boolean;               // Account lock status
  loginAttempts: number;           // Failed login attempts
  lockUntil: Date;                 // Account lock expiration
  lastLogin: Date;                 // Last successful login
  createdAt: Date;                 // Account creation date
  updatedAt: Date;                 // Last update date
}
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Account Lockout**: Automatic lockout after 5 failed attempts (2 hours)
- **Email 2FA**: 6-digit OTP codes sent via email
- **Token Expiration**: 
  - Temporary tokens: 10 minutes
  - Access tokens: 7 days
- **CORS Protection**: Configured for specific frontend origin
- **Input Validation**: Email format and password strength validation

## 🧪 Testing

### Using Postman

1. **Import Collection**: Create a Postman collection with the endpoints above
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:5000`
   - `temp_token`: (set after login)
   - `access_token`: (set after verify-2fa)

3. **Test Flow**:
   - Login → Get tempToken
   - Check email for OTP
   - Verify 2FA → Get access token
   - Use access token for protected routes

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"utsavsingh2826@gmail.com","password":"Utsav@1234"}'

# Verify 2FA (replace with actual tempToken and code)
curl -X POST http://localhost:5000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"tempToken":"YOUR_TEMP_TOKEN","code":"123456"}'

# Get current user (replace with actual token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
mongod
# Or check MongoDB service status
```

### Email Not Sending
```
Error: Failed to send verification code
```
**Solution**: 
- Check email credentials in `.env`
- For Gmail, use App Password (not regular password)
- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Check spam folder for OTP emails

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: 
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check backend CORS configuration in `server.ts`

### Token Expired
```
Error: Token expired or invalid
```
**Solution**: 
- Temporary tokens expire in 10 minutes
- Access tokens expire in 7 days
- Re-login to get new tokens

### User Not Found
```
Error: User not found
```
**Solution**: 
- Run seed script: `npm run seed`
- Verify user exists in MongoDB
- Check email spelling (case-insensitive)

## 📝 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Create superadmin user in database
- `npm run create-user` - Create test admin user

## 🔄 Development Workflow

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Seed Database**
   ```bash
   npm run seed
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

4. **Test Login**
   - Use Postman or frontend
   - Login with: `utsavsingh2826@gmail.com` / `Utsav@1234`
   - Check email for OTP
   - Verify OTP to complete login

## 📚 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- `nodemailer` - Email sending
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot-reload
- `ts-node` - TypeScript execution
- `@types/*` - TypeScript type definitions

## 📄 License

MIT

## 👥 Author

Jewelry Admin Team

## 🆘 Support

For issues or questions, please contact the development team.

---

**Note**: This is a production-ready backend with real authentication. The login flow requires email verification via OTP codes. Make sure your email configuration is properly set up before testing.
