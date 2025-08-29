# 🚨 CRITICAL CURSOR RULES - ENIOLABI.COM PROJECT

## **⚠️ MANDATORY: READ THESE RULES BEFORE EVERY PROMPT**

**This file contains critical prevention measures and best practices that MUST be reviewed before making any changes to the codebase. Failure to follow these rules will result in server conflicts, broken functionality, and deployment issues.**

**ALWAYS CHECK:**
1. **Server routing status** (Section 1-10)
2. **Code quality rules** (Section 11-13) 
3. **Prevention measures** (Section 16-20)
4. **Current production status** (Section at bottom)

---

## **SERVER ROUTING & DEPLOYMENT RULES (MANDATORY)**

### **1. 🚨 ALWAYS Verify Server Status Before Changes**
```bash
# BEFORE making ANY changes, run these commands:
ps aux | grep "next\|300" | grep -v grep
ss -tlnp | grep "300"
cat /etc/nginx/sites-enabled/eniolabi.com | grep "proxy_pass"
```

### **2. 🚨 NEVER Assume Which Server is Serving the Domain**
- **Domain `eniolabi.com`** → Nginx → specific localhost port
- **Development server ≠ Production server ≠ Domain server**
- **Always verify routing before claiming "changes are working"**
- **Test `eniolabi.com` NOT just `localhost:300X`**

### **3. 🚨 Server Management Protocol (MANDATORY)**
```bash
# STEP 1: Document current state
ps aux | grep "next-server" | grep -v grep
ss -tlnp | grep "300"
cat /etc/nginx/sites-enabled/eniolabi.com | grep "proxy_pass"

# STEP 2: Stop ALL conflicting servers
pkill -f "next-server"

# STEP 3: Start fresh server
npm run dev &

# STEP 4: Identify new port
ss -tlnp | grep "next"

# STEP 5: Update Nginx
sudo sed -i 's/localhost:300[0-9]/localhost:NEW_PORT/g' /etc/nginx/sites-enabled/eniolabi.com

# STEP 6: Reload Nginx
sudo systemctl reload nginx

# STEP 7: Verify domain works
curl -s -I https://eniolabi.com
```

### **4. 🚨 Port Assignment Rules**
- **Port 3000**: Wiki.js Docker container (NEVER change)
- **Port 3001**: Docker container (NEVER change)  
- **Port 3002+**: Next.js Service Hub (assign dynamically)
- **NEVER use ports 3000 or 3001 for Service Hub**

### **5. 🚨 When Reporting "Fixed" (MANDATORY CHECKLIST)**
- [ ] Must test on actual domain: `https://eniolabi.com`
- [ ] Must verify Nginx routing is updated to correct port
- [ ] Must confirm old server is stopped
- [ ] Must confirm new server is responding
- [ ] Must test at least 3 routes: `/`, `/notes`, `/dashboard`

### **6. 🚨 Emergency Recovery Commands**
```bash
# If domain shows "Bad Gateway" or 502:
pkill -f "next-server"
npm run dev &
NEW_PORT=$(ss -tlnp | grep "next" | grep -o "300[0-9]" | head -1)
sudo sed -i "s/localhost:300[0-9]/localhost:$NEW_PORT/g" /etc/nginx/sites-enabled/eniolabi.com
sudo systemctl reload nginx
curl -s -I https://eniolabi.com
```

### **7. 🚨 Development vs Production Rules**
- **Development**: Use `npm run dev` (dynamic port assignment)
- **Production**: Use `npm run start` (fixed port assignment)
- **NEVER run both simultaneously**
- **Always use development for testing changes**

### **8. 🚨 Nginx Configuration Rules**
- **Primary config**: `/etc/nginx/sites-enabled/eniolabi.com`
- **Backup config**: `/etc/nginx/sites-available/eniolabi.com`
- **Always verify**: `sudo nginx -t` before reloading
- **Reload command**: `sudo systemctl reload nginx`

### **9. 🚨 Testing Protocol (MANDATORY)**
```bash
# Test sequence:
curl -s -I https://eniolabi.com                    # Should return 200
curl -s -I https://eniolabi.com/notes             # Should return 200  
curl -s -I https://eniolabi.com/dashboard         # Should return 404 (unauthenticated)
curl -s https://eniolabi.com | grep "Service Hub" # Should find text
```

### **10. 🚨 Conflict Prevention Rules**
- **One Next.js server per port**
- **Stop ALL servers before starting new one**
- **Verify port is free before starting**
- **Update Nginx immediately after port change**
- **Test domain routing after every change**

---

## **CODE QUALITY RULES**

### **11. 🚨 React Hooks Rules (CRITICAL)**
- **ALL hooks must be called unconditionally at component top level**
- **NEVER call hooks inside conditional blocks**
- **NEVER call hooks inside loops or nested functions**
- **Use `useEffect` for conditional logic, not conditional hook calls**

### **12. 🚨 Error Handling Rules**
- **Always add null-safe property access**: `data?.property || defaultValue`
- **Handle undefined arrays**: `array || []`
- **Handle undefined numbers**: `number || 0`
- **Handle undefined booleans**: `boolean || false`

### **13. 🚨 Build & Test Rules**
- **Always run `npm run build` after changes**
- **Fix ALL linter errors before committing**
- **Test on actual domain, not just localhost**
- **Verify all routes work after changes**

---

## **COMMUNICATION RULES**

### **14. 🚨 Status Reporting Rules**
- **NEVER say "fixed" without testing domain**
- **ALWAYS include test results in status updates**
- **Report actual HTTP status codes, not just "working"**
- **Include port numbers in all server discussions**

### **15. 🚨 Problem Escalation Rules**
- **If domain shows 502/Bad Gateway**: Use Emergency Recovery Commands
- **If multiple servers running**: Stop ALL and start fresh
- **If Nginx errors**: Check logs with `sudo tail -20 /var/log/nginx/error.log`
- **If persistent issues**: Document exact error messages and server states**

---

## **🛡️ PREVENTION MEASURES & BEST PRACTICES**

### **16. 🚨 Code Change Prevention Rules (MANDATORY)**
- **ALWAYS rebuild and restart PM2 after making code changes**
- **Check for missing shared utilities before implementing new features**
- **Verify Tailwind plugins are properly configured for new CSS classes**
- **Test dark mode rendering for all new UI components**

### **17. 🚨 Notes & API Prevention Rules**
- **Verify all shared error utilities exist before using them**
- **Check Prisma schema is in sync before testing database operations**
- **Ensure all tRPC routers are properly registered in main router**
- **Test API endpoints with authentication before claiming they work**

### **18. 🚨 UI/UX Prevention Rules**
- **Always test both light and dark themes for new components**
- **Verify responsive design works on multiple screen sizes**
- **Check accessibility features (aria-labels, keyboard navigation)**
- **Test form submissions with proper error handling**

### **19. 🚨 Build & Deployment Prevention Rules**
- **Run `npm run build` after ANY code changes**
- **Fix ALL TypeScript and linter errors before deployment**
- **Verify Tailwind CSS classes are properly generated**
- **Test on actual domain after every deployment**

### **20. 🚨 Database & Schema Prevention Rules**
- **Run `npx prisma db push` after schema changes**
- **Verify database connections before testing features**
- **Check for missing database models in Prisma schema**
- **Test CRUD operations with proper error handling**

---

## **IMPLEMENTATION NOTES**

- **These rules are MANDATORY for all future development**
- **Violation of these rules will cause server conflicts**
- **Always reference this file before making server changes**
- **Update rules when new issues are discovered**

**Last Updated**: August 29, 2025 - Added comprehensive prevention measures and best practices
**Status**: ACTIVE - All rules must be followed

---

## **🚀 PRODUCTION DEPLOYMENT SOLUTION**

### **Current Mode**: DEVELOPMENT (`next dev`) - UNSTABLE
### **Target Mode**: PRODUCTION (`npm start`) with PM2 - STABLE

### **PERMANENT AUTOMATION IMPLEMENTED ✅**

**Your server is now FULLY AUTOMATED and will:**
- 🚀 **Start automatically on every boot**
- 🔄 **Restart automatically if it crashes**
- 🎯 **Always run on fixed port 3002**
- 📊 **Monitor itself with PM2**
- 🛡️ **Never require manual intervention**

### **Monitoring Commands:**
```bash
# Check production status
./scripts/monitor-production.sh

# PM2 status
pm2 status

# View logs
pm2 logs eniolabi-service-hub

# Restart if needed (rarely required)
pm2 restart eniolabi-service-hub
```

### **Emergency Commands (if needed):**
```bash
# Full restart
pm2 restart eniolabi-service-hub

# Check systemd service
sudo systemctl status pm2-olabi

# Manual restart (emergency only)
sudo systemctl restart pm2-olabi
```

### **Why Production Mode is Better:**
1. **Fixed Port**: Always runs on port 3002
2. **Auto-restart**: PM2 restarts on crashes
3. **Process Management**: Professional monitoring
4. **Boot Persistence**: Starts automatically on server reboot
5. **Performance**: Optimized for production use
6. **Stability**: No development mode overhead
