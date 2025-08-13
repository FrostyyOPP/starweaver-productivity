# 🔐 Starweaver Authentication System

This document describes the complete authentication system for the Starweaver Productivity app.

## 🏗️ **Architecture Overview**

The authentication system consists of:
- **User Model**: MongoDB schema with password hashing
- **JWT Tokens**: Access tokens + refresh tokens
- **API Routes**: Login, signup, logout, token refresh
- **Middleware**: Route protection and authentication
- **Utility Functions**: Client-side authentication helpers

## 📁 **File Structure**

```
src/
├── lib/
│   ├── db.ts                 # MongoDB connection
│   ├── jwt.ts                # JWT utilities
│   ├── auth.ts               # Client-side auth helpers
│   └── models/
│       └── User.ts           # User model
├── app/
│   └── api/
│       └── auth/
│           ├── login/        # Login API
│           ├── signup/       # Signup API
│           ├── logout/       # Logout API
│           └── refresh/      # Token refresh API
└── middleware.ts             # Route protection
```

## 🚀 **Setup Instructions**

### 1. **Environment Variables**
Create a `.env.local` file with:
```bash
MONGODB_URI=mongodb://localhost:27017/starweaver-productivity
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 2. **MongoDB Setup**
- Install MongoDB locally or use MongoDB Atlas
- Create a database named `starweaver-productivity`
- The system will automatically create collections

### 3. **Install Dependencies**
```bash
npm install bcryptjs jsonwebtoken mongoose @types/bcryptjs @types/jsonwebtoken
```

## 🔧 **API Endpoints**

### **POST /api/auth/signup**
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor"  // Optional: admin, editor, viewer
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "editor",
    "isActive": true,
    "createdAt": "2025-01-13T..."
  }
}
```

### **POST /api/auth/login**
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "editor",
    "lastLogin": "2025-01-13T..."
  },
  "accessToken": "jwt_token_here"
}
```

### **POST /api/auth/refresh**
Get a new access token using refresh token.

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_token",
  "user": { ... }
}
```

### **POST /api/auth/logout**
Logout user and clear cookies.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 🛡️ **Security Features**

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Refresh tokens stored securely
- **Route Protection**: Middleware for protected routes
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error messages

## 🔒 **Protected Routes**

The following routes require authentication:
- `/dashboard`
- `/daily-entry`
- `/manage`
- `/export`

## 💻 **Client-Side Usage**

### **Login Example:**
```typescript
import { authAPI, authStorage } from '@/lib/auth';

try {
  const response = await authAPI.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  // Store token and user data
  authStorage.setToken(response.accessToken);
  authStorage.setUser(response.user);
  
  // Redirect to dashboard
  router.push('/dashboard');
} catch (error) {
  console.error('Login failed:', error);
}
```

### **Signup Example:**
```typescript
try {
  const response = await authAPI.signup({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'editor'
  });
  
  // Auto-login after signup
  authStorage.setToken(response.accessToken);
  authStorage.setUser(response.user);
  
  router.push('/dashboard');
} catch (error) {
  console.error('Signup failed:', error);
}
```

### **Logout Example:**
```typescript
try {
  await authAPI.logout();
  authStorage.clear();
  router.push('/login');
} catch (error) {
  console.error('Logout failed:', error);
}
```

## 🔄 **Token Management**

- **Access Token**: Short-lived (7 days), stored in localStorage
- **Refresh Token**: Long-lived (30 days), stored in HTTP-only cookies
- **Auto-refresh**: Automatically refresh expired tokens
- **Secure Storage**: Tokens handled securely

## 🧪 **Testing the System**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

3. **Test login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## 🚨 **Production Considerations**

- **Change JWT_SECRET** to a strong, unique key
- **Use HTTPS** in production
- **Set secure cookies** in production
- **Implement rate limiting** for API endpoints
- **Add logging** for security events
- **Regular security audits** of dependencies

## 📚 **Additional Resources**

- [JWT.io](https://jwt.io/) - JWT token debugger
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js/) - Password hashing
