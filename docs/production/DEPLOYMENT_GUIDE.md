# 🚀 PRODUCTION DEPLOYMENT GUIDE
## Eniolabi Service Hub - Complete Deployment Instructions

**Date**: October 1, 2025  
**Version**: 3.0.0  
**Status**: Production Ready  

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **System Requirements**
- **OS**: Linux (Ubuntu/Debian recommended)
- **Node.js**: v18+ (v20+ recommended)
- **Memory**: 2GB+ RAM
- **Storage**: 10GB+ free space
- **Network**: Ports 3003, 5433, 6380 available

### **Dependencies**
- **PostgreSQL**: v13+ (running on port 5433)
- **Redis**: v6+ (running on port 6380)
- **Nginx**: v1.18+ (reverse proxy)
- **PM2**: v6+ (process manager)
- **Git**: For code deployment

---

## 🔧 **DEPLOYMENT STEPS**

### **Step 1: System Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL and Redis
sudo apt install postgresql redis-server -y
```

### **Step 2: Database Setup**
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE eniolabi_hub;
CREATE USER your_username WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE eniolabi_hub TO your_username;
\q

# Configure PostgreSQL to run on port 5433
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change: port = 5433
sudo systemctl restart postgresql
```

### **Step 3: Redis Setup**
```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Configure Redis to run on port 6380
sudo nano /etc/redis/redis.conf
# Change: port 6380
sudo systemctl restart redis-server
```

### **Step 4: Application Deployment**
```bash
# Clone repository
git clone https://github.com/your-repo/eniolabi-service-hub.git
cd eniolabi-service-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.production
nano .env.production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### **Step 5: Auto-Start Configuration**
```bash
# Generate startup script
pm2 startup

# Run the generated command (example):
sudo env PATH=$PATH:/usr/bin /home/olabi/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u olabi --hp /home/olabi

# Verify auto-start is enabled
sudo systemctl is-enabled pm2-olabi
```

### **Step 6: Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/eniolabi.com

# Add configuration:
server {
    listen 80;
    server_name eniolabi.com www.eniolabi.com;
    
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/eniolabi.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 7: SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d eniolabi.com -d www.eniolabi.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🔄 **UPDATING THE APPLICATION**

### **Code Updates**
```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Build application
npm run build

# Restart PM2 process
pm2 restart eniolabi-service-hub

# Verify deployment
curl -I https://eniolabi.com
```

### **Database Updates**
```bash
# Run migrations (if any)
npx prisma db push

# Seed database (if needed)
npx prisma db seed
```

---

## 🛠️ **MAINTENANCE COMMANDS**

### **Process Management**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs eniolabi-service-hub

# Restart application
pm2 restart eniolabi-service-hub

# Stop application
pm2 stop eniolabi-service-hub

# Delete application
pm2 delete eniolabi-service-hub
```

### **System Monitoring**
```bash
# Check system resources
htop
df -h
free -h

# Check service status
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
sudo systemctl status pm2-olabi

# Check logs
sudo journalctl -u pm2-olabi -f
sudo tail -f /var/log/nginx/error.log
```

### **Database Management**
```bash
# Connect to database
psql -h localhost -p 5433 -U olabi -d eniolabi_hub

# Backup database
pg_dump -h localhost -p 5433 -U olabi eniolabi_hub > backup.sql

# Restore database
psql -h localhost -p 5433 -U olabi -d eniolabi_hub < backup.sql
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check PM2 logs
pm2 logs eniolabi-service-hub

# Check if port is in use
sudo netstat -tlnp | grep :3003

# Kill process using port
sudo kill -9 $(sudo lsof -t -i:3003)
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -tlnp | grep :5433

# Test connection
psql -h localhost -p 5433 -U olabi -d eniolabi_hub
```

#### **Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis-server

# Check if port is listening
sudo netstat -tlnp | grep :6380

# Test connection
redis-cli -p 6380 ping
```

#### **Nginx Issues**
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### **Performance Issues**
```bash
# Check memory usage
free -h
pm2 monit

# Check disk space
df -h

# Check CPU usage
top
```

---

## 📊 **MONITORING SETUP**

### **Basic Monitoring**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Set up log rotation
sudo nano /etc/logrotate.d/eniolabi
```

### **Advanced Monitoring (Optional)**
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Set up monitoring dashboard
pm2 install pm2-server-monit
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Firewall Configuration**
```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3003  # Application (if needed)

# Deny direct access to database ports
sudo ufw deny 5433   # PostgreSQL
sudo ufw deny 6380   # Redis
```

### **User Permissions**
```bash
# Create application user
sudo useradd -m -s /bin/bash olabi

# Set proper permissions
sudo chown -R olabi:olabi /var/www/eniolabi.com
sudo chmod -R 755 /var/www/eniolabi.com
```

---

## 📋 **POST-DEPLOYMENT VERIFICATION**

### **Health Checks**
```bash
# Test website accessibility
curl -I https://eniolabi.com

# Test API endpoints
curl https://eniolabi.com/api/trpc/services.getAll

# Test database connection
psql -h localhost -p 5433 -U olabi -d eniolabi_hub -c "SELECT 1;"

# Test Redis connection
redis-cli -p 6380 ping
```

### **Feature Testing**
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] Dashboard displays services
- [ ] Profile management works
- [ ] Notes system functions
- [ ] Theme switching works
- [ ] Service launcher works
- [ ] Real-time updates work

---

## 📞 **SUPPORT & MAINTENANCE**

### **Regular Maintenance**
- **Daily**: Check application status
- **Weekly**: Review logs and performance
- **Monthly**: Update dependencies
- **Quarterly**: Security updates

### **Backup Strategy**
- **Database**: Daily automated backups
- **Code**: Git repository
- **Configuration**: Documented and version controlled
- **Logs**: Rotated and archived

---

**This deployment guide ensures a robust, secure, and maintainable production environment for the Eniolabi Service Hub.**

**Last Updated**: October 1, 2025  
**Version**: 3.0.0  
**Status**: Production Ready ✅
