# 🚀 Starweaver Productivity Backend System

This document describes the complete backend system for the Starweaver Productivity app, including all models, API endpoints, and business logic.

## 🏗️ **System Architecture**

The backend is built with:
- **Next.js 15** with App Router
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **RESTful API** design
- **TypeScript** for type safety
- **Middleware** for route protection

## 📁 **Complete File Structure**

```
src/
├── lib/
│   ├── db.ts                 # MongoDB connection utility
│   ├── jwt.ts                # JWT token management
│   ├── auth.ts               # Client-side auth helpers
│   └── models/
│       ├── User.ts           # User authentication model
│       ├── Entry.ts          # Daily productivity entries
│       ├── Team.ts           # Team management
│       └── Analytics.ts      # Performance analytics
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/        # User authentication
│       │   ├── signup/       # User registration
│       │   ├── refresh/      # Token refresh
│       │   └── logout/       # User logout
│       ├── entries/          # CRUD operations for entries
│       ├── dashboard/        # Dashboard statistics
│       ├── analytics/        # Performance analytics
│       ├── export/           # Data export (CSV/Excel)
│       └── teams/            # Team management
└── middleware.ts             # Route protection
```

## 🗄️ **Database Models**

### **1. User Model (`User.ts`)**
- **Authentication**: Email/password with bcrypt hashing
- **Roles**: admin, editor, viewer
- **Profile**: Name, email, role, active status
- **Security**: Password hashing, JWT tokens
- **Indexes**: Email, role, active status

**Key Features:**
- Password hashing with bcrypt (12 salt rounds)
- Role-based access control
- Account activation/deactivation
- Last login tracking
- Email validation and uniqueness

### **2. Entry Model (`Entry.ts`)**
- **Productivity Tracking**: Videos completed, hours worked
- **Metrics**: Productivity score, target achievement
- **Wellness**: Mood, energy level, challenges, achievements
- **Time Tracking**: Shift start/end, total hours
- **Validation**: Data integrity and business rules

**Key Features:**
- Automatic productivity score calculation
- Shift duration calculation
- One entry per user per day
- Comprehensive validation
- Performance optimization with indexes

### **3. Team Model (`Team.ts`)**
- **Team Management**: Members, admins, goals
- **Collaboration**: Member roles and permissions
- **Goals**: Daily, weekly, monthly targets
- **Settings**: Privacy, invites, approvals

**Key Features:**
- Member management (add/remove/promote)
- Goal setting and tracking
- Privacy controls
- Admin hierarchy

### **4. Analytics Model (`Analytics.ts`)**
- **Performance Metrics**: Productivity trends, efficiency
- **Insights**: Best performing times, patterns
- **Trends**: Increasing/decreasing performance
- **Recommendations**: Break times, focus areas

**Key Features:**
- Automatic trend calculation
- Performance insights generation
- Historical data analysis
- Team performance aggregation

## 🔌 **API Endpoints**

### **Authentication APIs**

#### **POST /api/auth/signup**
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "editor"
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

#### **POST /api/auth/login**
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
  "user": { ... },
  "accessToken": "jwt_token_here"
}
```

#### **POST /api/auth/refresh**
Get new access token using refresh token.

#### **POST /api/auth/logout**
Logout user and clear cookies.

### **Productivity APIs**

#### **GET /api/entries**
Get user's productivity entries with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Entries per page (default: 10)
- `startDate`: Start date filter
- `endDate`: End date filter
- `sortBy`: Sort field (default: date)
- `sortOrder`: Sort direction (default: desc)

#### **POST /api/entries**
Create a new productivity entry.

**Request Body:**
```json
{
  "date": "2025-01-13",
  "shiftStart": "2025-01-13T09:00:00Z",
  "shiftEnd": "2025-01-13T17:00:00Z",
  "videosCompleted": 18,
  "targetVideos": 15,
  "notes": "Great productivity today!",
  "mood": "excellent",
  "energyLevel": 5,
  "challenges": ["Technical issues"],
  "achievements": ["Exceeded target"]
}
```

#### **GET /api/entries/[id]**
Get a specific entry by ID.

#### **PUT /api/entries/[id]**
Update an existing entry.

#### **DELETE /api/entries/[id]**
Delete an entry.

### **Dashboard APIs**

#### **GET /api/dashboard**
Get comprehensive dashboard data and statistics.

**Query Parameters:**
- `period`: Time period (week, month, year)
- `includeTeam`: Include team statistics (admin only)

**Response:**
```json
{
  "period": "week",
  "dateRange": { "startDate": "...", "endDate": "..." },
  "userStats": {
    "totalVideos": 105,
    "totalHours": 56,
    "averageProductivity": 87,
    "targetAchievement": 93,
    "consistencyScore": 85
  },
  "goalProgress": {
    "daily": { "target": 15, "achieved": 18, "percentage": 120 },
    "weekly": { "target": 90, "achieved": 105, "percentage": 117 },
    "monthly": { "target": 360, "achieved": 420, "percentage": 117 }
  },
  "recentEntries": [...],
  "productivityTrends": [...],
  "insights": { "mood": [...], "energy": [...] },
  "teamStats": { ... }
}
```

### **Analytics APIs**

#### **GET /api/analytics**
Get detailed productivity analytics and insights.

**Query Parameters:**
- `period`: Time period (week, month, year)
- `includeTrends`: Include productivity trends
- `includeInsights`: Include mood and energy insights

**Response:**
```json
{
  "period": "week",
  "dateRange": { "startDate": "...", "endDate": "..." },
  "analytics": {
    "summary": {
      "totalVideos": 105,
      "totalHours": 56,
      "averageProductivity": 87,
      "averageVideosPerDay": 15,
      "averageHoursPerDay": 8,
      "targetAchievement": 93,
      "consistencyScore": 85,
      "improvementRate": 12
    },
    "performance": {
      "bestDay": { "date": "...", "productivityScore": 95, "videosCompleted": 20 },
      "worstDay": { "date": "...", "productivityScore": 75, "videosCompleted": 12 },
      "mostProductiveHour": 10
    },
    "trends": [...],
    "insights": { "mood": [...], "energy": [...] }
  }
}
```

### **Export APIs**

#### **GET /api/export**
Export productivity data in various formats.

**Query Parameters:**
- `format`: Export format (json, csv, excel)
- `startDate`: Start date for export
- `endDate`: End date for export
- `includeAnalytics`: Include analytics data

**Supported Formats:**
- **JSON**: Full data with analytics
- **CSV**: Tabular data for spreadsheet applications
- **Excel**: Tab-separated data with .xlsx extension

### **Team Management APIs**

#### **GET /api/teams**
Get user's teams and team information.

#### **POST /api/teams**
Create a new team (admin only).

**Request Body:**
```json
{
  "name": "Productivity Team A",
  "description": "High-performing productivity team",
  "goals": {
    "dailyTarget": 20,
    "weeklyTarget": 120,
    "monthlyTarget": 480
  },
  "settings": {
    "allowMemberInvites": true,
    "requireApproval": false,
    "visibility": "private"
  }
}
```

## 🔒 **Security Features**

### **Authentication & Authorization**
- **JWT Tokens**: Secure access tokens with expiration
- **Refresh Tokens**: Long-lived tokens stored in HTTP-only cookies
- **Role-Based Access**: Admin, editor, viewer permissions
- **Route Protection**: Middleware for protected routes

### **Data Security**
- **Password Hashing**: Bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Mongoose ODM protection
- **XSS Protection**: Input sanitization

### **API Security**
- **Rate Limiting**: Built-in Next.js protection
- **CORS**: Configurable cross-origin policies
- **Error Handling**: Secure error messages
- **Token Validation**: JWT signature verification

## 📊 **Performance Features**

### **Database Optimization**
- **Indexes**: Strategic indexing for common queries
- **Connection Pooling**: Efficient MongoDB connections
- **Query Optimization**: Aggregation pipelines for complex data
- **Data Pagination**: Efficient large dataset handling

### **Caching Strategy**
- **Connection Caching**: Reuse database connections
- **Query Caching**: Cache frequently accessed data
- **Response Caching**: HTTP caching headers

### **Scalability**
- **Horizontal Scaling**: Stateless API design
- **Load Balancing**: Ready for multiple instances
- **Database Sharding**: MongoDB sharding support

## 🧪 **Testing & Development**

### **Local Development**
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Start development server
npm run dev

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### **API Testing Examples**

#### **Create Entry**
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2025-01-13",
    "shiftStart": "2025-01-13T09:00:00Z",
    "shiftEnd": "2025-01-13T17:00:00Z",
    "videosCompleted": 18,
    "targetVideos": 15
  }'
```

#### **Get Dashboard Data**
```bash
curl -X GET "http://localhost:3000/api/dashboard?period=week&includeTeam=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **Export Data**
```bash
curl -X GET "http://localhost:3000/api/export?format=csv&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output productivity-export.csv
```

## 🚀 **Production Deployment**

### **Environment Variables**
```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-256-bits-long
NODE_ENV=production

# Optional
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### **Database Setup**
- **MongoDB Atlas**: Cloud-hosted MongoDB service
- **Connection String**: Secure connection with authentication
- **Indexes**: Automatic index creation
- **Backup**: Automated backups and point-in-time recovery

### **Security Considerations**
- **HTTPS**: SSL/TLS encryption
- **JWT Secret**: Strong, unique secret key
- **Rate Limiting**: API rate limiting
- **Monitoring**: Logging and error tracking

## 📈 **Monitoring & Analytics**

### **Performance Metrics**
- **Response Times**: API endpoint performance
- **Error Rates**: Success/failure ratios
- **Database Performance**: Query execution times
- **User Activity**: Authentication and usage patterns

### **Logging**
- **Request Logging**: API call tracking
- **Error Logging**: Detailed error information
- **Performance Logging**: Slow query identification
- **Security Logging**: Authentication events

## 🔄 **Future Enhancements**

### **Planned Features**
- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: Machine learning insights
- **Mobile API**: Optimized mobile endpoints
- **Webhook System**: External integrations
- **Advanced Reporting**: Custom report generation

### **Scalability Improvements**
- **Redis Caching**: Advanced caching layer
- **CDN Integration**: Static asset delivery
- **Microservices**: Service decomposition
- **GraphQL**: Alternative to REST API

## 📚 **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js/) - Password hashing

---

This backend system provides a robust, scalable foundation for the Starweaver Productivity app with comprehensive features for user management, productivity tracking, team collaboration, and data analytics.
