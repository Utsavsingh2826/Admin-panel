# User Management API & Frontend Flow Documentation

## Overview

This document describes the complete User Management system implementation, including backend APIs, frontend integration, and the data flow between components.

---

## Table of Contents

1. [Backend API Endpoints](#backend-api-endpoints)
2. [Frontend Components](#frontend-components)
3. [Data Flow](#data-flow)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Request/Response Examples](#api-requestresponse-examples)
6. [Frontend State Management](#frontend-state-management)
7. [Testing Guide](#testing-guide)

---

## Backend API Endpoints

### Base URL
```
http://localhost:5000/api/users
```

All endpoints require:
- **Authentication**: Valid JWT token in `Authorization: Bearer <token>` header
- **Authorization**: User must have `superadmin` role

---

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (`active`, `inactive`, `locked`)
- `role` (optional): Filter by role (`superadmin`, `admin`, `manager`, `staff`)

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
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isActive": true,
      "isLocked": false,
      "loginAttempts": 0,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Single User

**Endpoint:** `GET /api/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "isActive": true,
    "isLocked": false,
    "loginAttempts": 0,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. Create User

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "role": "staff",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "staff",
    "isActive": true,
    "isLocked": false,
    "loginAttempts": 0
  }
}
```

**Validation:**
- `name`: Required, max 50 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `role`: Must be one of: `superadmin`, `admin`, `manager`, `staff`

---

### 4. Update User

**Endpoint:** `PUT /api/users/:id`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "NewPassword123",  // Optional
  "role": "manager",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "manager",
    "isActive": true
  }
}
```

**Security:**
- Cannot change your own role
- Email must be unique if changed

---

### 5. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "User deleted successfully"
}
```

**Security:**
- Cannot delete your own account

---

### 6. Toggle User Status

**Endpoint:** `PATCH /api/users/:id/toggle-status`

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "isActive": false
  },
  "message": "User deactivated successfully"
}
```

**Security:**
- Cannot deactivate your own account

---

### 7. Unlock User Account

**Endpoint:** `PATCH /api/users/:id/unlock`

**Request Body:** Empty

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "isLocked": false,
    "loginAttempts": 0,
    "lockUntil": null
  },
  "message": "User account unlocked successfully"
}
```

**Functionality:**
- Resets `isLocked` to `false`
- Clears `lockUntil`
- Resets `loginAttempts` to `0`

---

### 8. Reset Password

**Endpoint:** `PATCH /api/users/:id/reset-password`

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Validation:**
- `newPassword`: Required, min 6 characters
- Password is automatically hashed before storage

---

## Frontend Components

### 1. Users Page Component

**Location:** `src/pages/Admin/Users.tsx`

**Features:**
- User table with pagination
- Search functionality
- Status and role filters
- Create/Edit user modal
- View user details modal
- Reset password modal
- Toggle active/inactive status
- Unlock locked accounts
- Delete users

### 2. Redux Store Structure

**Location:** `src/store/users/`

**Files:**
- `actionTypes.ts`: Action type constants
- `actions.ts`: Action creators (async thunks)
- `reducer.ts`: Redux reducer

**State Structure:**
```typescript
{
  users: User[],
  currentUser: User | null,
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

### 1. User List Flow

```
User Action (Load Page)
    ↓
useEffect Hook Triggers
    ↓
dispatch(fetchUsers(page, limit, search, status, role))
    ↓
Redux Action: FETCH_USERS_REQUEST
    ↓
API Call: GET /api/users?page=1&limit=10&search=...
    ↓
Backend: userController.getUsers()
    ↓
Database Query with Filters
    ↓
Response: { success, data, total, page, pages }
    ↓
Redux Action: FETCH_USERS_SUCCESS
    ↓
State Updated: users, total, page, pages
    ↓
Component Re-renders with New Data
    ↓
Table Displays Users
```

### 2. Create User Flow

```
User Clicks "Add User"
    ↓
Modal Opens with Empty Form
    ↓
User Fills Form (name, email, password, role, isActive)
    ↓
User Clicks "Create"
    ↓
handleSubmit() Validates Form
    ↓
dispatch(createUser(formData))
    ↓
Redux Action: CREATE_USER_REQUEST
    ↓
API Call: POST /api/users
    ↓
Backend: userController.createUser()
    ↓
Validation & Password Hashing
    ↓
Database: User.create()
    ↓
Response: { success, data: newUser }
    ↓
Redux Action: CREATE_USER_SUCCESS
    ↓
State Updated: users array prepended with newUser
    ↓
Toast Notification: "User created successfully"
    ↓
Modal Closes
    ↓
loadUsers() Refreshes List
    ↓
Table Shows New User
```

### 3. Update User Flow

```
User Clicks Edit Icon
    ↓
Modal Opens with Pre-filled Form
    ↓
User Modifies Fields
    ↓
User Clicks "Update"
    ↓
handleSubmit() Validates Form
    ↓
dispatch(updateUser(userId, updateData))
    ↓
Redux Action: UPDATE_USER_REQUEST
    ↓
API Call: PUT /api/users/:id
    ↓
Backend: userController.updateUser()
    ↓
Validation & Updates
    ↓
Database: user.save()
    ↓
Response: { success, data: updatedUser }
    ↓
Redux Action: UPDATE_USER_SUCCESS
    ↓
State Updated: users array updated with new data
    ↓
Toast Notification: "User updated successfully"
    ↓
Modal Closes
    ↓
Table Shows Updated User
```

### 4. Toggle Status Flow

```
User Clicks Toggle Switch
    ↓
Confirmation Dialog: "Activate/Deactivate this user?"
    ↓
User Confirms
    ↓
dispatch(toggleUserStatus(userId))
    ↓
Redux Action: TOGGLE_USER_STATUS_REQUEST
    ↓
API Call: PATCH /api/users/:id/toggle-status
    ↓
Backend: userController.toggleUserStatus()
    ↓
Database: user.isActive = !user.isActive, user.save()
    ↓
Response: { success, data: updatedUser }
    ↓
Redux Action: TOGGLE_USER_STATUS_SUCCESS
    ↓
State Updated: users array updated
    ↓
Toast Notification: "User activated/deactivated successfully"
    ↓
Table Shows Updated Status Badge
```

### 5. Unlock Account Flow

```
User Clicks "Unlock" Button (visible when account is locked)
    ↓
Confirmation Dialog: "Unlock this account? Login attempts will be reset."
    ↓
User Confirms
    ↓
dispatch(unlockUser(userId))
    ↓
Redux Action: UNLOCK_USER_REQUEST
    ↓
API Call: PATCH /api/users/:id/unlock
    ↓
Backend: userController.unlockUser()
    ↓
Database: 
  - user.isLocked = false
  - user.lockUntil = null
  - user.loginAttempts = 0
  - user.save()
    ↓
Response: { success, data: updatedUser }
    ↓
Redux Action: UNLOCK_USER_SUCCESS
    ↓
State Updated: users array updated
    ↓
Toast Notification: "User account unlocked successfully"
    ↓
Table Shows "Unlocked" Status
```

### 6. Reset Password Flow

```
User Clicks "Reset Password" Icon
    ↓
Modal Opens with Password Form
    ↓
User Enters New Password (twice for confirmation)
    ↓
User Clicks "Reset Password"
    ↓
handleResetPassword() Validates:
  - Passwords match
  - Password length >= 6
    ↓
dispatch(resetPassword(userId, { newPassword }))
    ↓
Redux Action: RESET_PASSWORD_REQUEST
    ↓
API Call: PATCH /api/users/:id/reset-password
    ↓
Backend: userController.resetPassword()
    ↓
Validation & Password Hashing (via pre-save middleware)
    ↓
Database: user.password = newPassword, user.save()
    ↓
Response: { success, message }
    ↓
Redux Action: RESET_PASSWORD_SUCCESS
    ↓
Toast Notification: "Password reset successfully"
    ↓
Modal Closes
```

### 7. Delete User Flow

```
User Clicks Delete Icon
    ↓
Confirmation Dialog: "Are you sure you want to delete this user?"
    ↓
User Confirms
    ↓
dispatch(deleteUser(userId))
    ↓
Redux Action: DELETE_USER_REQUEST
    ↓
API Call: DELETE /api/users/:id
    ↓
Backend: userController.deleteUser()
    ↓
Security Check: Cannot delete yourself
    ↓
Database: user.deleteOne()
    ↓
Response: { success, message }
    ↓
Redux Action: DELETE_USER_SUCCESS
    ↓
State Updated: users array filtered (user removed)
    ↓
Toast Notification: "User deleted successfully"
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

```typescript
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse('Not authorized', 403));
    }
    next();
  };
};
```

**Usage:**
```typescript
router.use(protect);           // Requires authentication
router.use(authorize('superadmin'));  // Requires superadmin role
```

### Frontend Route Protection

**Location:** `src/App.tsx`

- Users page route: `/users`
- Protected by `PrivateRoute` component
- Checks `isAuthenticated` from Redux store
- Redirects to `/login` if not authenticated

### Sidebar Menu Visibility

**Location:** `src/components/VerticalLayout/Sidebar.tsx`

- Users menu item only visible to `superadmin` users:
```typescript
.filter(item => {
  if (item.id === 'users' && user?.role !== 'superadmin') {
    return false;
  }
  return true;
});
```

---

## API Request/Response Examples

### Example 1: Get Users with Filters

**Request:**
```http
GET /api/users?page=1&limit=10&search=john&status=active&role=admin
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
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isActive": true,
      "isLocked": false,
      "loginAttempts": 0,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Example 2: Create User

**Request:**
```http
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "role": "staff",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "staff",
    "isActive": true,
    "isLocked": false,
    "loginAttempts": 0,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Example 3: Error Response

**Request:**
```http
POST /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Test User",
  "email": "existing@example.com",
  "password": "123"
}
```

**Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

## Frontend State Management

### Redux Actions

**Available Actions:**
- `fetchUsers(page, limit, search, status, role)` - Get all users
- `fetchUser(id)` - Get single user
- `createUser(userData)` - Create new user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user
- `toggleUserStatus(id)` - Toggle active/inactive
- `unlockUser(id)` - Unlock locked account
- `resetPassword(id, passwordData)` - Reset password
- `clearUserErrors()` - Clear error state

### State Updates

**Loading State:**
- Set to `true` when any async action starts
- Set to `false` when action completes (success or failure)

**Error Handling:**
- Errors stored in `error` field
- Displayed in UI via toast notifications
- Can be cleared with `clearUserErrors()`

**Optimistic Updates:**
- Create: New user added to array immediately
- Update: User in array replaced with updated data
- Delete: User removed from array immediately
- Toggle/Unlock: User in array updated immediately

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

   **Get Users:**
   ```bash
   curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **Create User:**
   ```bash
   curl -X POST "http://localhost:5000/api/users" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Test123","role":"staff","isActive":true}'
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

3. **Access Users Page:**
   - Click "Users" in sidebar (only visible to superadmin)
   - Verify table loads with users

4. **Test Features:**
   - ✅ Create new user
   - ✅ Edit existing user
   - ✅ Toggle user status
   - ✅ Unlock locked account
   - ✅ Reset password
   - ✅ View user details
   - ✅ Delete user
   - ✅ Search users
   - ✅ Filter by status/role
   - ✅ Pagination

### Integration Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Login flow works (email + password + 2FA)
- [ ] Users page accessible only to superadmin
- [ ] Users table displays correctly
- [ ] Create user works end-to-end
- [ ] Edit user works end-to-end
- [ ] Delete user works end-to-end
- [ ] Toggle status works end-to-end
- [ ] Unlock account works end-to-end
- [ ] Reset password works end-to-end
- [ ] Search functionality works
- [ ] Filters work correctly
- [ ] Pagination works correctly
- [ ] Error handling displays properly
- [ ] Success notifications appear
- [ ] Cannot delete/edit own account (security)

---

## Security Features

1. **Role-Based Access Control:**
   - Only `superadmin` can access user management
   - Backend validates role on every request
   - Frontend hides menu item for non-superadmin users

2. **Self-Protection:**
   - Cannot delete your own account
   - Cannot deactivate your own account
   - Cannot change your own role

3. **Password Security:**
   - Passwords hashed using bcrypt (12 rounds)
   - Minimum 6 characters required
   - Passwords never returned in API responses

4. **Authentication:**
   - JWT tokens with expiration
   - 2FA required for login
   - Token validation on every request

5. **Input Validation:**
   - Email format validation
   - Role enum validation
   - Required field validation
   - Password length validation

---

## File Structure

```
admin backend new/
├── src/
│   ├── controllers/
│   │   └── userController.ts       # User CRUD operations
│   ├── middleware/
│   │   ├── auth.ts                 # Authentication middleware
│   │   └── authorize.ts            # Role-based authorization
│   ├── models/
│   │   └── User.ts                  # User schema
│   ├── routes/
│   │   └── users.ts                 # User routes
│   └── server.ts                    # Express server setup

admin frontend new/
├── src/
│   ├── pages/
│   │   └── Admin/
│   │       └── Users.tsx            # Users management page
│   ├── store/
│   │   └── users/
│   │       ├── actionTypes.ts       # Action type constants
│   │       ├── actions.ts           # Redux actions
│   │       └── reducer.ts           # Redux reducer
│   ├── components/
│   │   └── VerticalLayout/
│   │       └── Sidebar.tsx          # Sidebar with Users menu
│   └── App.tsx                      # Routes configuration
```

---

## Conclusion

The User Management system provides a complete CRUD interface for managing users with:
- ✅ Full backend API with proper authentication/authorization
- ✅ Modern React frontend with Redux state management
- ✅ Real-time updates and optimistic UI
- ✅ Comprehensive error handling
- ✅ Security features and self-protection
- ✅ Search, filter, and pagination
- ✅ Status management (activate/deactivate/unlock)
- ✅ Password reset functionality

All features are fully integrated and tested, ready for production use.

