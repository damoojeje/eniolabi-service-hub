# 🔌 API REFERENCE
## Eniolabi Service Hub - Complete API Documentation

**Date**: October 1, 2025  
**Version**: 3.0.0  
**Base URL**: https://eniolabi.com/api/trpc  
**Authentication**: NextAuth.js (Session-based)  

---

## 📋 **API OVERVIEW**

The Eniolabi Service Hub uses **tRPC** for type-safe API communication. All endpoints are available under `/api/trpc/` with the following structure:

```
https://eniolabi.com/api/trpc/{router}.{procedure}
```

### **Available Routers**
- **services** - Service management and monitoring
- **users** - User CRUD and role management
- **notifications** - Real-time notification system
- **notes** - Note creation and organization
- **analytics** - System metrics and reporting
- **health** - Service health monitoring
- **systemSettings** - Application configuration

---

## 🔧 **SERVICES ROUTER** (`/api/trpc/services.*`)

### **Get All Services**
```typescript
GET /api/trpc/services.getAll
```
**Description**: Retrieve all services with their current status  
**Authentication**: Required  
**Response**: Array of service objects with status information

### **Get Service by ID**
```typescript
GET /api/trpc/services.getById
```
**Description**: Get detailed information about a specific service  
**Parameters**: `{ id: string }`  
**Authentication**: Required

### **Check Service Health**
```typescript
POST /api/trpc/services.checkHealth
```
**Description**: Manually trigger health check for a service  
**Parameters**: `{ serviceId: string }`  
**Authentication**: Required

### **Check All Services Health**
```typescript
POST /api/trpc/services.checkAllHealth
```
**Description**: Trigger health check for all services  
**Authentication**: Required (Admin only)

### **Get System Statistics**
```typescript
GET /api/trpc/services.getSystemStats
```
**Description**: Get overall system statistics  
**Authentication**: Required  
**Response**: System stats including uptime, response times, etc.

### **Create Service** (Admin Only)
```typescript
POST /api/trpc/services.create
```
**Description**: Create a new service  
**Parameters**: Service configuration object  
**Authentication**: Required (Admin only)

### **Update Service** (Admin Only)
```typescript
POST /api/trpc/services.update
```
**Description**: Update an existing service  
**Parameters**: `{ id: string, data: ServiceUpdateInput }`  
**Authentication**: Required (Admin only)

### **Delete Service** (Admin Only)
```typescript
POST /api/trpc/services.delete
```
**Description**: Delete a service  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Toggle Service Status** (Admin Only)
```typescript
POST /api/trpc/services.toggleStatus
```
**Description**: Enable/disable a service  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

---

## 👥 **USERS ROUTER** (`/api/trpc/users.*`)

### **Get Current User**
```typescript
GET /api/trpc/users.me
```
**Description**: Get current user profile  
**Authentication**: Required  
**Response**: Current user object

### **Update Profile**
```typescript
POST /api/trpc/users.updateProfile
```
**Description**: Update current user's profile  
**Parameters**: `{ name?: string, image?: string }`  
**Authentication**: Required

### **Get All Users** (Admin Only)
```typescript
GET /api/trpc/users.getAll
```
**Description**: Get list of all users  
**Authentication**: Required (Admin only)  
**Response**: Array of user objects

### **Get User by ID** (Admin Only)
```typescript
GET /api/trpc/users.getById
```
**Description**: Get user by ID  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Create User** (Admin Only)
```typescript
POST /api/trpc/users.create
```
**Description**: Create a new user  
**Parameters**: User creation object  
**Authentication**: Required (Admin only)

### **Update User** (Admin Only)
```typescript
POST /api/trpc/users.update
```
**Description**: Update user information  
**Parameters**: `{ id: string, data: UserUpdateInput }`  
**Authentication**: Required (Admin only)

### **Update User Role** (Admin Only)
```typescript
POST /api/trpc/users.updateRole
```
**Description**: Update user role  
**Parameters**: `{ id: string, role: Role }`  
**Authentication**: Required (Admin only)

### **Reset Password** (Admin Only)
```typescript
POST /api/trpc/users.resetPassword
```
**Description**: Reset user password  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Toggle User Status** (Admin Only)
```typescript
POST /api/trpc/users.toggleStatus
```
**Description**: Enable/disable user account  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Delete User** (Admin Only)
```typescript
POST /api/trpc/users.delete
```
**Description**: Delete user account  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

---

## 🔔 **NOTIFICATIONS ROUTER** (`/api/trpc/notifications.*`)

### **Get Notification Preferences**
```typescript
GET /api/trpc/notifications.getPreferences
```
**Description**: Get user's notification preferences  
**Authentication**: Required

### **Update Notification Preferences**
```typescript
POST /api/trpc/notifications.updatePreferences
```
**Description**: Update notification preferences  
**Parameters**: Notification preferences object  
**Authentication**: Required

### **Get Notifications**
```typescript
GET /api/trpc/notifications.getNotifications
```
**Description**: Get user's notifications  
**Authentication**: Required  
**Response**: Array of notification objects

### **Mark Notification as Read**
```typescript
POST /api/trpc/notifications.markAsRead
```
**Description**: Mark a notification as read  
**Parameters**: `{ id: string }`  
**Authentication**: Required

### **Mark All Notifications as Read**
```typescript
POST /api/trpc/notifications.markAllAsRead
```
**Description**: Mark all notifications as read  
**Authentication**: Required

### **Delete Notification**
```typescript
POST /api/trpc/notifications.delete
```
**Description**: Delete a notification  
**Parameters**: `{ id: string }`  
**Authentication**: Required

### **Get Notification Statistics**
```typescript
GET /api/trpc/notifications.getStats
```
**Description**: Get notification statistics  
**Authentication**: Required

### **Create Notification** (Admin Only)
```typescript
POST /api/trpc/notifications.create
```
**Description**: Create a notification  
**Parameters**: Notification creation object  
**Authentication**: Required (Admin only)

### **Broadcast Notification** (Admin Only)
```typescript
POST /api/trpc/notifications.broadcast
```
**Description**: Broadcast notification to all users  
**Parameters**: Broadcast notification object  
**Authentication**: Required (Admin only)

---

## 📝 **NOTES ROUTER** (`/api/trpc/notes.*`)

### **Get Notes**
```typescript
GET /api/trpc/notes.getNotes
```
**Description**: Get user's notes  
**Authentication**: Required  
**Response**: Array of note objects

### **Get Note by ID**
```typescript
GET /api/trpc/notes.getNote
```
**Description**: Get specific note  
**Parameters**: `{ id: string }`  
**Authentication**: Required

### **Create Note**
```typescript
POST /api/trpc/notes.createNote
```
**Description**: Create a new note  
**Parameters**: Note creation object  
**Authentication**: Required

### **Update Note**
```typescript
POST /api/trpc/notes.updateNote
```
**Description**: Update an existing note  
**Parameters**: `{ id: string, data: NoteUpdateInput }`  
**Authentication**: Required

### **Delete Note**
```typescript
POST /api/trpc/notes.deleteNote
```
**Description**: Delete a note  
**Parameters**: `{ id: string }`  
**Authentication**: Required

### **Search Notes**
```typescript
GET /api/trpc/notes.searchNotes
```
**Description**: Search notes by query  
**Parameters**: `{ query: string }`  
**Authentication**: Required

### **Get Note Categories**
```typescript
GET /api/trpc/notes.getCategories
```
**Description**: Get available note categories  
**Authentication**: Required

### **Get Notes Statistics**
```typescript
GET /api/trpc/notes.getStats
```
**Description**: Get notes statistics  
**Authentication**: Required

---

## 📊 **ANALYTICS ROUTER** (`/api/trpc/analytics.*`)

### **Get Service Metrics**
```typescript
GET /api/trpc/analytics.getServiceMetrics
```
**Description**: Get service performance metrics  
**Authentication**: Required

### **Get Uptime Data**
```typescript
GET /api/trpc/analytics.getUptimeData
```
**Description**: Get service uptime data  
**Authentication**: Required

### **Get Response Time Data**
```typescript
GET /api/trpc/analytics.getResponseTimeData
```
**Description**: Get response time metrics  
**Authentication**: Required

### **Get Status Distribution**
```typescript
GET /api/trpc/analytics.getStatusDistribution
```
**Description**: Get service status distribution  
**Authentication**: Required

### **Get Error Rate**
```typescript
GET /api/trpc/analytics.getErrorRate
```
**Description**: Get error rate data  
**Authentication**: Required

### **Get Availability**
```typescript
GET /api/trpc/analytics.getAvailability
```
**Description**: Get availability metrics  
**Authentication**: Required

### **Get Incidents**
```typescript
GET /api/trpc/analytics.getIncidents
```
**Description**: Get incident data  
**Authentication**: Required

### **Create Incident** (Admin Only)
```typescript
POST /api/trpc/analytics.createIncident
```
**Description**: Create a new incident  
**Parameters**: Incident creation object  
**Authentication**: Required (Admin only)

### **Update Incident** (Admin Only)
```typescript
POST /api/trpc/analytics.updateIncident
```
**Description**: Update an incident  
**Parameters**: `{ id: string, data: IncidentUpdateInput }`  
**Authentication**: Required (Admin only)

### **Resolve Incident** (Admin Only)
```typescript
POST /api/trpc/analytics.resolveIncident
```
**Description**: Resolve an incident  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Get Reports**
```typescript
GET /api/trpc/analytics.getReports
```
**Description**: Get analytics reports  
**Authentication**: Required

### **Generate Report** (Admin Only)
```typescript
POST /api/trpc/analytics.generateReport
```
**Description**: Generate a new report  
**Parameters**: Report generation object  
**Authentication**: Required (Admin only)

---

## 🏥 **HEALTH ROUTER** (`/api/trpc/health.*`)

### **Get System Health**
```typescript
GET /api/trpc/health.getSystemHealth
```
**Description**: Get overall system health status  
**Authentication**: Required

### **Get Component Health**
```typescript
GET /api/trpc/health.getComponentHealth
```
**Description**: Get individual component health  
**Authentication**: Required

### **Get Health History**
```typescript
GET /api/trpc/health.getHealthHistory
```
**Description**: Get health monitoring history  
**Authentication**: Required

### **Create Health Check** (Admin Only)
```typescript
POST /api/trpc/health.createHealthCheck
```
**Description**: Create a new health check  
**Parameters**: Health check configuration  
**Authentication**: Required (Admin only)

### **Update Health Check** (Admin Only)
```typescript
POST /api/trpc/health.updateHealthCheck
```
**Description**: Update health check configuration  
**Parameters**: `{ id: string, data: HealthCheckUpdateInput }`  
**Authentication**: Required (Admin only)

### **Delete Health Check** (Admin Only)
```typescript
POST /api/trpc/health.deleteHealthCheck
```
**Description**: Delete a health check  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Get Health Incidents**
```typescript
GET /api/trpc/health.getIncidents
```
**Description**: Get health-related incidents  
**Authentication**: Required

### **Create Health Incident** (Admin Only)
```typescript
POST /api/trpc/health.createIncident
```
**Description**: Create a health incident  
**Parameters**: Health incident object  
**Authentication**: Required (Admin only)

### **Update Health Incident** (Admin Only)
```typescript
POST /api/trpc/health.updateIncident
```
**Description**: Update a health incident  
**Parameters**: `{ id: string, data: HealthIncidentUpdateInput }`  
**Authentication**: Required (Admin only)

### **Resolve Health Incident** (Admin Only)
```typescript
POST /api/trpc/health.resolveIncident
```
**Description**: Resolve a health incident  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Get Maintenance Windows**
```typescript
GET /api/trpc/health.getMaintenanceWindows
```
**Description**: Get maintenance windows  
**Authentication**: Required

### **Create Maintenance Window** (Admin Only)
```typescript
POST /api/trpc/health.createMaintenanceWindow
```
**Description**: Create a maintenance window  
**Parameters**: Maintenance window object  
**Authentication**: Required (Admin only)

### **Update Maintenance Window** (Admin Only)
```typescript
POST /api/trpc/health.updateMaintenanceWindow
```
**Description**: Update a maintenance window  
**Parameters**: `{ id: string, data: MaintenanceWindowUpdateInput }`  
**Authentication**: Required (Admin only)

### **Delete Maintenance Window** (Admin Only)
```typescript
POST /api/trpc/health.deleteMaintenanceWindow
```
**Description**: Delete a maintenance window  
**Parameters**: `{ id: string }`  
**Authentication**: Required (Admin only)

### **Check All Services** (Admin Only)
```typescript
POST /api/trpc/health.checkAllServices
```
**Description**: Trigger health check for all services  
**Authentication**: Required (Admin only)

---

## ⚙️ **SYSTEM SETTINGS ROUTER** (`/api/trpc/systemSettings.*`)

### **Get System Settings**
```typescript
GET /api/trpc/systemSettings.get
```
**Description**: Get current system settings  
**Authentication**: Required

### **Update System Settings** (Admin Only)
```typescript
POST /api/trpc/systemSettings.update
```
**Description**: Update system settings  
**Parameters**: System settings object  
**Authentication**: Required (Admin only)

### **Toggle Maintenance Mode** (Admin Only)
```typescript
POST /api/trpc/systemSettings.toggleMaintenanceMode
```
**Description**: Toggle maintenance mode  
**Authentication**: Required (Admin only)

### **Toggle Debug Mode** (Admin Only)
```typescript
POST /api/trpc/systemSettings.toggleDebugMode
```
**Description**: Toggle debug mode  
**Authentication**: Required (Admin only)

### **Get Health Check Configuration**
```typescript
GET /api/trpc/systemSettings.getHealthCheckConfig
```
**Description**: Get health check configuration  
**Authentication**: Required

### **Update Health Check Configuration** (Admin Only)
```typescript
POST /api/trpc/systemSettings.updateHealthCheckConfig
```
**Description**: Update health check configuration  
**Parameters**: Health check config object  
**Authentication**: Required (Admin only)

### **Get Notification Configuration**
```typescript
GET /api/trpc/systemSettings.getNotificationConfig
```
**Description**: Get notification configuration  
**Authentication**: Required

### **Update Notification Configuration** (Admin Only)
```typescript
POST /api/trpc.systemSettings.updateNotificationConfig
```
**Description**: Update notification configuration  
**Parameters**: Notification config object  
**Authentication**: Required (Admin only)

---

## 🔐 **AUTHENTICATION**

### **Session-Based Authentication**
The API uses NextAuth.js for authentication. All requests must include session cookies.

### **Role-Based Access Control**
- **ADMIN**: Full access to all endpoints
- **POWER_USER**: Limited admin access
- **GUEST**: Basic user access

### **Authentication Headers**
```http
Cookie: next-auth.session-token=your_session_token
```

---

## 📝 **ERROR HANDLING**

### **Standard Error Responses**
```typescript
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource"
  }
}
```

### **Common Error Codes**
- **UNAUTHORIZED**: Authentication required
- **FORBIDDEN**: Insufficient permissions
- **NOT_FOUND**: Resource not found
- **VALIDATION_ERROR**: Invalid input data
- **INTERNAL_SERVER_ERROR**: Server error

---

## 🚀 **USAGE EXAMPLES**

### **JavaScript/TypeScript Client**
```typescript
import { api } from '@/lib/trpc'

// Get all services
const { data: services } = api.services.getAll.useQuery()

// Create a note
const createNote = api.notes.createNote.useMutation()
createNote.mutate({
  title: 'My Note',
  content: 'Note content',
  category: 'general'
})

// Update user profile
const updateProfile = api.users.updateProfile.useMutation()
updateProfile.mutate({
  name: 'New Name',
  image: 'https://example.com/avatar.jpg'
})
```

### **cURL Examples**
```bash
# Get all services
curl -H "Cookie: next-auth.session-token=your_token" \
  https://eniolabi.com/api/trpc/services.getAll

# Create a note
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_token" \
  -d '{"title":"My Note","content":"Note content"}' \
  https://eniolabi.com/api/trpc/notes.createNote
```

---

## 📊 **RATE LIMITING**

### **Current Limits**
- **API Calls**: 1000 requests per hour per user
- **File Uploads**: 10MB per file
- **Concurrent Connections**: 100 per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

**This API reference provides complete documentation for all available endpoints in the Eniolabi Service Hub.**

**Last Updated**: October 1, 2025  
**Version**: 3.0.0  
**Status**: Production Ready ✅
