# Complete Setup Guide

## Backend Setup (TypeScript)

### 1. Navigate to backend directory
```bash
cd "admin backend new"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Copy `env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jewelry-admin
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kynajewels.com
FRONTEND_URL=http://localhost:5173
```

### 4. Create test user
```bash
npm run create-user
```

This creates:
- Email: `admin@jewelry.com`
- Password: `admin123`
- Role: `admin`

### 5. Start backend server
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd "admin frontend new"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file (optional)
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Testing the Login Flow

1. **Start MongoDB** (if not running)
2. **Start Backend**: `cd "admin backend new" && npm run dev`
3. **Start Frontend**: `cd "admin frontend new" && npm run dev`
4. **Open browser**: `http://localhost:5173/login`
5. **Login with**:
   - Email: `admin@jewelry.com`
   - Password: `admin123`
6. **Check email** for 6-digit verification code
7. **Enter code** to complete login

## API Testing with Postman/curl

### 1. Login (Step 1)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jewelry.com","password":"admin123"}'
```

Response:
```json
{
  "success": true,
  "requires2FA": true,
  "tempToken": "eyJhbGc...",
  "message": "Verification code sent to your email"
}
```

### 2. Verify 2FA (Step 2)
```bash
curl -X POST http://localhost:5000/api/auth/verify-2fa \
  -H "Content-Type: application/json" \
  -d '{"tempToken":"YOUR_TEMP_TOKEN","code":"123456"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@jewelry.com",
    "role": "admin"
  }
}
```

### 3. Get Current User (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check `MONGODB_URI` in `.env`

### Email Not Sending
- Check email credentials in `.env`
- For Gmail, use App Password (not regular password)
- Check spam folder

### CORS Error
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check backend CORS configuration

### TypeScript Errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` configuration

## Project Structure

```
admin backend new/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── authController.ts
│   ├── middleware/
│   │   ├── asyncHandler.ts
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   └── auth.ts
│   ├── scripts/
│   │   └── createTestUser.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── errorResponse.ts
│   │   └── sendEmail.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── env.example
```

