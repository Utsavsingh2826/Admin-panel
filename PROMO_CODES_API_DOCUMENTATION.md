# Promo Codes Management API & Frontend Flow Documentation

## Overview

This document describes the complete Promo Codes Management system implementation, including backend APIs, frontend integration, and the data flow between components. The system allows administrators to create, manage, and validate promo codes with discount percentages.

---

## Table of Contents

1. [Backend API Endpoints](#backend-api-endpoints)
2. [Frontend Components](#frontend-components)
3. [Data Flow](#data-flow)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Request/Response Examples](#api-requestresponse-examples)
6. [Frontend State Management](#frontend-state-management)
7. [User Website Integration](#user-website-integration)
8. [Testing Guide](#testing-guide)

---

## Backend API Endpoints

### Base URL
```
http://localhost:5000/api/promocodes
```

### Admin Endpoints (Require Authentication & Superadmin Role)

All admin endpoints require:
- **Authentication**: Valid JWT token in `Authorization: Bearer <token>` header
- **Authorization**: User must have `superadmin` role

---

### 1. Get All Promo Codes

**Endpoint:** `GET /api/promocodes`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by promo code
- `status` (optional): Filter by status (`active`, `inactive`)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "promocode_id",
      "code": "SUMMER2024",
      "discountPercent": 20,
      "isActive": true,
      "description": "Summer sale promo code",
      "createdBy": {
        "_id": "user_id",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Promo Code

**Endpoint:** `GET /api/promocodes/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "promocode_id",
    "code": "SUMMER2024",
    "discountPercent": 20,
    "isActive": true,
    "description": "Summer sale promo code",
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Create Promo Code

**Endpoint:** `POST /api/promocodes`

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "discountPercent": 20,
  "description": "Summer sale promo code",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_promocode_id",
    "code": "SUMMER2024",
    "discountPercent": 20,
    "isActive": true,
    "description": "Summer sale promo code",
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Validation:**
- `code`: Required, 3-20 characters, uppercase alphanumeric only, unique
- `discountPercent`: Required, number between 1-100
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean (default: true)

---

### 4. Update Promo Code

**Endpoint:** `PUT /api/promocodes/:id`

**Request Body:**
```json
{
  "discountPercent": 25,
  "description": "Updated summer sale promo code",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "promocode_id",
    "code": "SUMMER2024",
    "discountPercent": 25,
    "isActive": false,
    "description": "Updated summer sale promo code",
    "createdBy": {
      "_id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

**Note:** Code cannot be changed once created.

---

### 5. Delete Promo Code

**Endpoint:** `DELETE /api/promocodes/:id`

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Promo code deleted successfully"
}
```

---

### 6. Toggle Promo Code Status

**Endpoint:** `PATCH /api/promocodes/:id/toggle-status`

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "promocode_id",
    "code": "SUMMER2024",
    "discountPercent": 20,
    "isActive": false
  },
  "message": "Promo code deactivated successfully"
}
```

---

### 7. Validate Promo Code (Public Endpoint)

**Endpoint:** `POST /api/promocodes/validate`

**Access:** Public (No authentication required)

**Request Body:**
```json
{
  "code": "SUMMER2024",
  "orderAmount": 100
}
```

**Response (Valid):**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "code": "SUMMER2024",
    "discountPercent": 20,
    "discountAmount": 20.00,
    "finalAmount": 80.00
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "valid": false,
  "error": "Promo code not found"
}
```

**Possible Errors:**
- `"Promo code not found"` - Code doesn't exist
- `"Promo code is inactive"` - Code exists but isActive is false

---

## Frontend Components

### 1. Promo Codes Page Component

**Location:** `src/pages/Admin/PromoCodes.tsx`

**Features:**
- Promo codes table with pagination
- Search functionality (by code)
- Status filter (Active/Inactive)
- Create/Edit promo code modal
- View promo code details modal
- Toggle active/inactive status
- Delete promo codes

### 2. Redux Store Structure

**Location:** `src/store/promocodes/`

**Files:**
- `actionTypes.ts`: Action type constants
- `actions.ts`: Action creators (async thunks)
- `reducer.ts`: Redux reducer

**State Structure:**
```typescript
{
  promoCodes: PromoCode[],
  currentPromoCode: PromoCode | null,
  loading: boolean,
  error: string | null,
  total: number,
  page: number,
  pages: number
}
```

### 3. API Integration

**Location:** `src/utils/api.ts`

**Configuration:**
- Base URL: `/api` (development) or `http://localhost:5000/api` (production)
- Automatic token injection via request interceptor
- Error handling via response interceptor
- Automatic redirect to login on 401 errors

---

## Data Flow

### 1. Promo Codes List Flow

```
Admin Action (Load Page)
    ↓
useEffect Hook Triggers
    ↓
dispatch(fetchPromoCodes(page, limit, search, status))
    ↓
Redux Action: FETCH_PROMOCODES_REQUEST
    ↓
API Call: GET /api/promocodes?page=1&limit=10&search=...&status=...
    ↓
Backend: promoCodeController.getPromoCodes()
    ↓
Database Query with Filters
    ↓
Response: { success, data, total, page, pages }
    ↓
Redux Action: FETCH_PROMOCODES_SUCCESS
    ↓
State Updated: promoCodes, total, page, pages
    ↓
Component Re-renders with New Data
    ↓
Table Displays Promo Codes
```

### 2. Create Promo Code Flow

```
Admin Clicks "Add Promo Code"
    ↓
Modal Opens with Empty Form
    ↓
Admin Fills Form (code, discountPercent, description, isActive)
    ↓
Admin Clicks "Create"
    ↓
handleSubmit() Validates Form
    ↓
dispatch(createPromoCode(formData))
    ↓
Redux Action: CREATE_PROMOCODE_REQUEST
    ↓
API Call: POST /api/promocodes
    ↓
Backend: promoCodeController.createPromoCode()
    ↓
Validation & Code Uniqueness Check
    ↓
Database: PromoCode.create()
    ↓
Response: { success, data: newPromoCode }
    ↓
Redux Action: CREATE_PROMOCODE_SUCCESS
    ↓
State Updated: promoCodes array prepended with newPromoCode
    ↓
Toast Notification: "Promo code created successfully"
    ↓
Modal Closes
    ↓
loadPromoCodes() Refreshes List
    ↓
Table Shows New Promo Code
```

### 3. Update Promo Code Flow

```
Admin Clicks Edit Icon
    ↓
Modal Opens with Pre-filled Form (code field disabled)
    ↓
Admin Modifies Fields (discountPercent, description, isActive)
    ↓
Admin Clicks "Update"
    ↓
handleSubmit() Validates Form
    ↓
dispatch(updatePromoCode(promoCodeId, updateData))
    ↓
Redux Action: UPDATE_PROMOCODE_REQUEST
    ↓
API Call: PUT /api/promocodes/:id
    ↓
Backend: promoCodeController.updatePromoCode()
    ↓
Validation & Updates
    ↓
Database: promoCode.save()
    ↓
Response: { success, data: updatedPromoCode }
    ↓
Redux Action: UPDATE_PROMOCODE_SUCCESS
    ↓
State Updated: promoCodes array updated with new data
    ↓
Toast Notification: "Promo code updated successfully"
    ↓
Modal Closes
    ↓
Table Shows Updated Promo Code
```

### 4. Toggle Status Flow

```
Admin Clicks Toggle Switch
    ↓
Confirmation Dialog: "Activate/Deactivate this promo code?"
    ↓
Admin Confirms
    ↓
dispatch(togglePromoCodeStatus(promoCodeId))
    ↓
Redux Action: TOGGLE_PROMOCODE_STATUS_REQUEST
    ↓
API Call: PATCH /api/promocodes/:id/toggle-status
    ↓
Backend: promoCodeController.togglePromoCodeStatus()
    ↓
Database: promoCode.isActive = !promoCode.isActive, promoCode.save()
    ↓
Response: { success, data: updatedPromoCode }
    ↓
Redux Action: TOGGLE_PROMOCODE_STATUS_SUCCESS
    ↓
State Updated: promoCodes array updated
    ↓
Toast Notification: "Promo code activated/deactivated successfully"
    ↓
Table Shows Updated Status Badge
```

### 5. Delete Promo Code Flow

```
Admin Clicks Delete Icon
    ↓
Confirmation Dialog: "Are you sure you want to delete this promo code?"
    ↓
Admin Confirms
    ↓
dispatch(deletePromoCode(promoCodeId))
    ↓
Redux Action: DELETE_PROMOCODE_REQUEST
    ↓
API Call: DELETE /api/promocodes/:id
    ↓
Backend: promoCodeController.deletePromoCode()
    ↓
Database: promoCode.deleteOne()
    ↓
Response: { success, message }
    ↓
Redux Action: DELETE_PROMOCODE_SUCCESS
    ↓
State Updated: promoCodes array filtered (promo code removed)
    ↓
Toast Notification: "Promo code deleted successfully"
    ↓
Table Shows Updated List
```

---

## Authentication & Authorization

### Authentication Flow

1. User logs in via `/api/auth/login`
2. Receives `tempToken` for 2FA
3. Verifies 2FA code via `/api/auth/verify-2fa`
4. Receives full `accessToken` (JWT)
5. Token stored in `localStorage`
6. Token automatically added to all API requests via Axios interceptor

### Authorization Middleware

**Backend:** `src/middleware/authorize.ts`

All admin endpoints use:
```typescript
router.use(protect);           // Requires authentication
router.use(authorize('superadmin'));  // Requires superadmin role
```

**Exception:** The `/validate` endpoint is public and does not require authentication.

### Frontend Route Protection

**Location:** `src/App.tsx`

- Promo codes page route: `/promocodes`
- Protected by `PrivateRoute` component
- Checks `isAuthenticated` from Redux store
- Redirects to `/login` if not authenticated

### Sidebar Menu Visibility

**Location:** `src/components/VerticalLayout/Sidebar.tsx`

- Promo Codes menu item only visible to `superadmin` users:
```typescript
.filter(item => {
  if ((item.id === 'users' || item.id === 'promocodes') && user?.role !== 'superadmin') {
    return false;
  }
  return true;
});
```

---

## API Request/Response Examples

### Example 1: Get Promo Codes with Filters

**Request:**
```http
GET /api/promocodes?page=1&limit=10&search=SUMMER&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "code": "SUMMER2024",
      "discountPercent": 20,
      "isActive": true,
      "description": "Summer sale promo code",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Example 2: Create Promo Code

**Request:**
```http
POST /api/promocodes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "code": "WINTER2024",
  "discountPercent": 15,
  "description": "Winter sale promo code",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "code": "WINTER2024",
    "discountPercent": 15,
    "isActive": true,
    "description": "Winter sale promo code",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Example 3: Validate Promo Code (User Website)

**Request:**
```http
POST /api/promocodes/validate
Content-Type: application/json

{
  "code": "SUMMER2024",
  "orderAmount": 100
}
```

**Response (Valid):**
```json
{
  "success": true,
  "valid": true,
  "data": {
    "code": "SUMMER2024",
    "discountPercent": 20,
    "discountAmount": 20.00,
    "finalAmount": 80.00
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "valid": false,
  "error": "Promo code is inactive"
}
```

### Example 4: Error Response

**Request:**
```http
POST /api/promocodes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "code": "EXISTING_CODE",
  "discountPercent": 25
}
```

**Response:**
```json
{
  "success": false,
  "error": "Promo code already exists"
}
```

---

## Frontend State Management

### Redux Actions

**Available Actions:**
- `fetchPromoCodes(page, limit, search, status)` - Get all promo codes
- `fetchPromoCode(id)` - Get single promo code
- `createPromoCode(promoCodeData)` - Create new promo code
- `updatePromoCode(id, promoCodeData)` - Update promo code
- `deletePromoCode(id)` - Delete promo code
- `togglePromoCodeStatus(id)` - Toggle active/inactive
- `clearPromoCodeErrors()` - Clear error state

### State Updates

**Loading State:**
- Set to `true` when any async action starts
- Set to `false` when action completes (success or failure)

**Error Handling:**
- Errors stored in `error` field
- Displayed in UI via toast notifications
- Can be cleared with `clearPromoCodeErrors()`

**Optimistic Updates:**
- Create: New promo code added to array immediately
- Update: Promo code in array replaced with updated data
- Delete: Promo code removed from array immediately
- Toggle: Promo code in array updated immediately

---

## User Website Integration

### Validate Promo Code Endpoint

The `/api/promocodes/validate` endpoint is designed for use in your user-facing website. It does not require authentication and can be called directly from your frontend.

### Integration Example (JavaScript/TypeScript)

```typescript
// Validate promo code when user enters it at checkout
const validatePromoCode = async (code: string, orderAmount: number) => {
  try {
    const response = await fetch('http://localhost:5000/api/promocodes/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        orderAmount: orderAmount,
      }),
    });

    const data = await response.json();

    if (data.valid) {
      // Apply discount
      console.log(`Discount: ${data.data.discountAmount}`);
      console.log(`Final Amount: ${data.data.finalAmount}`);
      return data.data;
    } else {
      // Show error message
      console.error(data.error);
      return null;
    }
  } catch (error) {
    console.error('Failed to validate promo code:', error);
    return null;
  }
};

// Usage
const discountInfo = await validatePromoCode('SUMMER2024', 100);
if (discountInfo) {
  // Update order total with discount
  setOrderTotal(discountInfo.finalAmount);
  setDiscount(discountInfo.discountAmount);
}
```

### Integration Example (React Hook)

```typescript
import { useState } from 'react';

const usePromoCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountInfo, setDiscountInfo] = useState<any>(null);

  const validatePromoCode = async (code: string, orderAmount: number) => {
    setLoading(true);
    setError(null);
    setDiscountInfo(null);

    try {
      const response = await fetch('http://localhost:5000/api/promocodes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          orderAmount: orderAmount,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscountInfo(data.data);
        return data.data;
      } else {
        setError(data.error);
        return null;
      }
    } catch (err: any) {
      setError('Failed to validate promo code');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    validatePromoCode,
    loading,
    error,
    discountInfo,
  };
};
```

### Important Notes for User Website Integration

1. **Base URL**: Update the base URL to match your production API URL
2. **Error Handling**: Always handle both network errors and validation errors
3. **Case Insensitive**: The code is automatically converted to uppercase, but you can send it in any case
4. **Order Amount**: Always send the current order amount to calculate the correct discount
5. **CORS**: Ensure your backend CORS settings allow requests from your user website domain

---

## Testing Guide

### Backend Testing

1. **Start Backend Server:**
   ```bash
   cd "admin backend new"
   npm run dev
   ```

2. **Verify Server Running:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Test Authentication:**
   - Login with superadmin credentials
   - Complete 2FA verification
   - Copy the access token

4. **Test APIs (using Postman or curl):**

   **Get Promo Codes:**
   ```bash
   curl -X GET "http://localhost:5000/api/promocodes?page=1&limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Create Promo Code:**
   ```bash
   curl -X POST "http://localhost:5000/api/promocodes" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"code":"TEST2024","discountPercent":10,"description":"Test promo code","isActive":true}'
   ```

   **Validate Promo Code (Public):**
   ```bash
   curl -X POST "http://localhost:5000/api/promocodes/validate" \
     -H "Content-Type: application/json" \
     -d '{"code":"TEST2024","orderAmount":100}'
   ```

### Frontend Testing

1. **Start Frontend Server:**
   ```bash
   cd "admin frontend new"
   npm run dev
   ```

2. **Login as Superadmin:**
   - Navigate to `http://localhost:5173/login`
   - Enter superadmin credentials
   - Complete 2FA verification

3. **Access Promo Codes Page:**
   - Click "Promo Codes" in sidebar (only visible to superadmin)
   - Verify table loads with promo codes

4. **Test Features:**
   - ✅ Create new promo code
   - ✅ Edit existing promo code
   - ✅ Toggle promo code status
   - ✅ View promo code details
   - ✅ Delete promo code
   - ✅ Search promo codes
   - ✅ Filter by status
   - ✅ Pagination

### Integration Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Login flow works (email + password + 2FA)
- [ ] Promo codes page accessible only to superadmin
- [ ] Promo codes table displays correctly
- [ ] Create promo code works end-to-end
- [ ] Edit promo code works end-to-end
- [ ] Delete promo code works end-to-end
- [ ] Toggle status works end-to-end
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Pagination works correctly
- [ ] Error handling displays properly
- [ ] Success notifications appear
- [ ] Validate endpoint works without authentication
- [ ] Validate endpoint returns correct discount calculations

---

## Security Features

1. **Role-Based Access Control:**
   - Only `superadmin` can access promo code management
   - Backend validates role on every request
   - Frontend hides menu item for non-superadmin users

2. **Input Validation:**
   - Code format validation (uppercase alphanumeric only)
   - Discount percent range validation (1-100)
   - Code uniqueness validation
   - Description length validation

3. **Authentication:**
   - JWT tokens with expiration
   - 2FA required for login
   - Token validation on every request

4. **Public Validation Endpoint:**
   - No authentication required for validation
   - Only returns validation result and discount calculation
   - Does not expose sensitive information

---

## Database Schema

### PromoCode Model

```typescript
{
  _id: ObjectId (auto-generated)
  code: String (required, unique, uppercase, 3-20 chars, alphanumeric)
  discountPercent: Number (required, 1-100)
  isActive: Boolean (default: true)
  description: String (optional, max 500 chars)
  createdBy: ObjectId (required, reference to User)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-updated)
}
```

### Indexes

- Unique index on `code`
- Index on `isActive`
- Compound index on `isActive` + `code`

---

## File Structure

```
admin backend new/
├── src/
│   ├── controllers/
│   │   └── promoCodeController.ts       # Promo code CRUD operations
│   ├── middleware/
│   │   ├── auth.ts                      # Authentication middleware
│   │   └── authorize.ts                 # Role-based authorization
│   ├── models/
│   │   └── PromoCode.ts                 # Promo code schema
│   ├── routes/
│   │   └── promocodes.ts                # Promo code routes
│   ├── types/
│   │   └── index.ts                      # TypeScript interfaces
│   └── server.ts                         # Express server setup

admin frontend new/
├── src/
│   ├── pages/
│   │   └── Admin/
│   │       └── PromoCodes.tsx            # Promo codes management page
│   ├── store/
│   │   └── promocodes/
│   │       ├── actionTypes.ts           # Action type constants
│   │       ├── actions.ts               # Redux actions
│   │       └── reducer.ts               # Redux reducer
│   ├── components/
│   │   └── VerticalLayout/
│   │       └── Sidebar.tsx               # Sidebar with Promo Codes menu
│   └── App.tsx                           # Routes configuration
```

---

## Conclusion

The Promo Codes Management system provides a complete CRUD interface for managing promo codes with:
- ✅ Full backend API with proper authentication/authorization
- ✅ Modern React frontend with Redux state management
- ✅ Real-time updates and optimistic UI
- ✅ Comprehensive error handling
- ✅ Security features and role-based access
- ✅ Search, filter, and pagination
- ✅ Status management (activate/deactivate)
- ✅ Public validation endpoint for user website integration

All features are fully integrated and tested, ready for production use. The validation endpoint can be easily integrated into your user-facing website to allow customers to apply promo codes during checkout.

