# ⚙️ ENIOLABI SERVICE HUB - PROJECT CONFIGURATION

## **🚀 PRODUCTION DEPLOYMENT STATUS**

### **Current Production Environment (ACTIVE)**
```bash
🌐 Domain: https://eniolabi.com
🔧 Server: PM2 managed Next.js production server
📡 Port: 3003 (FIXED - nginx configured)
🗄️ Database: PostgreSQL on port 5433
💾 Cache: Redis on port 6380
🔐 SSL: Let's Encrypt certificates (auto-renewal enabled)
🔄 Reverse Proxy: Nginx configured for port 3003
```

### **PM2 Process Management**
```bash
# Process Details:
Process Name: eniolabi-service-hub
Status: ONLINE ✅
Mode: Production (NODE_ENV=production)
Instances: 1 (fork mode)
Uptime: Stable with auto-restart enabled

# Management Commands:
pm2 status                              # Check status
pm2 logs eniolabi-service-hub          # View logs
pm2 restart eniolabi-service-hub       # Restart service
pm2 reload ecosystem.config.js --env production
```

## **🔗 NETWORK & PORT CONFIGURATION**

### **CRITICAL - Port Assignments (DO NOT CHANGE)**
```bash
📍 Port 3000: Wiki.js Docker container (RESERVED)
📍 Port 3001: Docker container (RESERVED)
📍 Port 3003: Next.js Service Hub (PRODUCTION)
📍 Port 5433: PostgreSQL Database
📍 Port 6380: Redis Cache Server
📍 Port 5173: WhenNxt React App (separate project)
```

### **Nginx Configuration**
```nginx
# Location: /etc/nginx/sites-enabled/eniolabi.com
server_name: eniolabi.com www.eniolabi.com
proxy_pass: http://localhost:3003
SSL: Let's Encrypt certificates configured
Security headers: Implemented and active
```

### **Network Verification Commands**
```bash
# Verify services are running:
ss -tlnp | grep "3003\|5433\|6380"
cat /etc/nginx/sites-enabled/eniolabi.com | grep proxy_pass
curl -I https://eniolabi.com
```

## **🗄️ DATABASE CONFIGURATION**

### **PostgreSQL Setup (Port 5433)**
```yaml
Database: eniolabi_service_hub
User: eniolabi  
Host: localhost
Port: 5433
Connection: postgresql://eniolabi:[YOUR_DATABASE_PASSWORD]@localhost:5433/eniolabi_service_hub
Status: ACTIVE ✅
```

### **Prisma Configuration**
```typescript
// Schema Location: /prisma/schema.prisma
// Migration Status: Up to date
// Connection Pool: Configured for production

// Key Models Implemented:
- User (authentication and profiles)
- Note (note-taking system) 
- Service (service monitoring)
- Notification (alert system)
- Analytics (metrics tracking)
- SystemSettings (configuration)
- Health (monitoring data)
```

### **Database Management Commands**
```bash
# Prisma Commands:
npx prisma db push              # Push schema changes
npx prisma generate            # Generate client
npx prisma studio             # Open database browser
npx prisma migrate reset      # Reset (DANGER - production)

# Connection Test:
psql postgresql://eniolabi:[YOUR_DATABASE_PASSWORD]@localhost:5433/eniolabi_service_hub
```

## **💾 REDIS CONFIGURATION**

### **Redis Cache Setup (Port 6380)**
```yaml
Host: localhost
Port: 6380  
Password: [YOUR_REDIS_PASSWORD]
URL: redis://:[YOUR_REDIS_PASSWORD]@localhost:6380
Status: ACTIVE ✅
Usage: Session storage, caching, real-time features
```

### **Redis Integration Points**
```typescript
// Configured in:
/src/lib/redis.ts           # Redis client setup
/src/contexts/              # Real-time contexts
/src/server/routers/        # API caching

// Used for:
- Session management
- Real-time notifications  
- API response caching
- SSE connection management
```

## **🔐 AUTHENTICATION CONFIGURATION**

### **NextAuth.js Setup**
```typescript
// Configuration: /src/lib/auth.ts
// API Routes: /src/app/api/auth/[...nextauth]/route.ts
// Environment Variables:
NEXTAUTH_URL=https://eniolabi.com
NEXTAUTH_SECRET=[YOUR_NEXTAUTH_SECRET]
NEXTAUTH_JWT_SECRET=[YOUR_JWT_SECRET]

// Current Status:
✅ Authentication working
✅ Admin user active ("admin")
⚠️ JWT decoding errors in logs (needs debugging)
✅ Session management functional
```

### **User Roles & Permissions**
```typescript
// Implemented Roles:
ADMIN: Full system access
USER: Limited access to personal features

// Current Users:
admin: Active in production (sessions working)
Status: Admin panel access confirmed
```

## **📦 APPLICATION CONFIGURATION**

### **Next.js Configuration**
```javascript
// File: /next.config.mjs
Framework: Next.js 14.2.32
Build Mode: Production optimized
TypeScript: Enabled with strict mode
ESLint: Configured (temporarily disabled for build)
Output: Static optimization enabled
```

### **Environment Variables (Production)**
```bash
# From /ecosystem.config.js - Production Environment:
NODE_ENV=production
PORT=3003
NEXTAUTH_URL=https://eniolabi.com
NEXTAUTH_SECRET=[YOUR_NEXTAUTH_SECRET]
NEXTAUTH_JWT_SECRET=[YOUR_JWT_SECRET]
DATABASE_URL=postgresql://eniolabi:[YOUR_DATABASE_PASSWORD]@localhost:5433/eniolabi_service_hub
REDIS_URL=redis://:[YOUR_REDIS_PASSWORD]@localhost:6380
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=[YOUR_REDIS_PASSWORD]
NEXT_TELEMETRY_DISABLED=1
```

### **Package Dependencies (Key Technologies)**
```json
{
  "next": "14.2.32",
  "@trpc/server": "Latest", 
  "@trpc/client": "Latest",
  "@prisma/client": "Latest",
  "next-auth": "Latest",
  "redis": "Latest",
  "tailwindcss": "Latest",
  "typescript": "Latest",
  "react": "18.x",
  "react-dom": "18.x"
}
```

## **🔧 DEVELOPMENT CONFIGURATION**

### **Development vs Production**
```bash
# Development Mode (Not Currently Active):
PORT=3003 (same as production for consistency)
NODE_ENV=development  
NEXTAUTH_URL=http://localhost:3003
Hot Reload: Enabled
Debug Logging: Enabled
Source Maps: Enabled

# Production Mode (CURRENTLY ACTIVE):
PORT=3003
NODE_ENV=production
NEXTAUTH_URL=https://eniolabi.com  
Optimizations: Enabled
Logging: Error/Warn only
Build: Optimized bundle
```

### **Build & Development Commands**
```bash
# Production Commands (Current):
npm run build                # Build production assets
npm run start               # Start production server
pm2 start ecosystem.config.js --env production

# Development Commands (If Needed):
npm run dev                 # Start development server
npm run lint               # Run ESLint
npm run type-check         # TypeScript checking

# Utility Commands:
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema changes
npm run db:migrate        # Run migrations
```

## **📊 MONITORING & LOGGING**

### **Log File Locations**
```bash
# PM2 Logs:
/var/www/eniolabi.com/logs/combined-0.log    # Combined output
/var/www/eniolabi.com/logs/error-0.log       # Error logs only
/var/www/eniolabi.com/logs/out-0.log         # Standard output

# System Logs:
/var/log/nginx/error.log                     # Nginx errors
/var/log/nginx/access.log                    # Nginx access logs

# Monitoring Commands:
pm2 logs eniolabi-service-hub --lines 20     # Recent app logs
sudo tail -f /var/log/nginx/error.log        # Live nginx errors
```

### **Health Check Endpoints**
```bash
# Application Status:
https://eniolabi.com/                        # Homepage (should return 200)
https://eniolabi.com/api/health              # Health check endpoint
https://eniolabi.com/dashboard               # Dashboard (requires auth)

# Server Status:
pm2 status                                   # PM2 process status
systemctl status nginx                       # Nginx status
ss -tlnp | grep 3003                        # Port verification
```

## **🚨 CRITICAL CONFIGURATION ISSUES**

### **Known Problems (MUST FIX)**
```bash
❌ JWT Token Processing:
   - JWT/Session decoding errors in logs
   - Authentication works but token processing fails
   - Location: Authentication middleware

❌ API Communication:
   - tRPC endpoints returning HTTP 204 instead of data
   - Client-server communication broken
   - Location: API layer integration

❌ Real-time Features:
   - SSE connections dropping frequently  
   - Notifications not updating live
   - Location: WebSocket/SSE implementation
```

### **Configuration Warnings**
```bash
⚠️  TypeScript & ESLint Temporarily Disabled:
   - Build errors were bypassed for production
   - Need to re-enable strict checking
   - Fix all type errors and lint warnings

⚠️  Production Secrets in Code:
   - Database passwords visible in ecosystem.config.js
   - Should move to environment file
   - Security concern for production
```

## **🔒 SECURITY CONFIGURATION**

### **Current Security Measures**
```bash
✅ SSL/TLS: Let's Encrypt certificates configured
✅ Security Headers: X-Frame-Options, X-Content-Type-Options, etc.
✅ HTTPS Redirect: All HTTP traffic redirected to HTTPS
✅ Database: Password-protected PostgreSQL
✅ Redis: Password-protected cache server
✅ Session Security: NextAuth.js with secure cookies
```

### **Security Recommendations**
```bash
🔧 Move secrets to environment files
🔧 Implement rate limiting on API endpoints
🔧 Add CSRF protection for forms
🔧 Implement API key authentication for service calls
🔧 Enable audit logging for admin actions
```

## **🛠️ MAINTENANCE & BACKUP**

### **Backup Locations**
```bash
# Database Backups:
/home/olabi/docker_backup/           # Docker configurations
/var/lib/postgresql/backups/         # Database dumps (if configured)

# Application Backups:
PM2 ecosystem saves configuration automatically
Nginx configurations backed up in /etc/nginx/sites-available/
```

### **Maintenance Commands**
```bash
# Regular Maintenance:
npm update                           # Update dependencies
pm2 save                            # Save PM2 configuration  
sudo certbot renew                  # Renew SSL certificates
sudo systemctl reload nginx        # Reload nginx config

# Emergency Recovery:
pm2 restart eniolabi-service-hub    # Restart application
sudo systemctl restart nginx       # Restart nginx
sudo systemctl restart postgresql  # Restart database
sudo systemctl restart redis       # Restart cache
```

## **📋 CONFIGURATION CHECKLIST**

### **Before Making Changes**
- [ ] Verify current PM2 status
- [ ] Check nginx configuration is correct
- [ ] Confirm database and Redis are running
- [ ] Test current domain functionality
- [ ] Review recent logs for any errors

### **After Making Changes**
- [ ] Run production build successfully
- [ ] Restart PM2 service
- [ ] Verify domain still works (https://eniolabi.com)
- [ ] Check logs for new errors
- [ ] Test critical functionality (auth, main pages)
- [ ] Monitor for any regressions

### **Configuration Files to Monitor**
- [ ] `/var/www/eniolabi.com/ecosystem.config.js` - PM2 configuration
- [ ] `/etc/nginx/sites-enabled/eniolabi.com` - Nginx proxy
- [ ] `/var/www/eniolabi.com/next.config.mjs` - Next.js configuration  
- [ ] `/var/www/eniolabi.com/prisma/schema.prisma` - Database schema
- [ ] `/var/www/eniolabi.com/src/lib/` - Core application libraries

---

**⚠️ CRITICAL REMINDER**: This is a **PRODUCTION ENVIRONMENT** serving the live domain https://eniolabi.com. Always test changes thoroughly and maintain the current port/service configurations unless absolutely necessary to change them.