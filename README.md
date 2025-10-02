# 🚀 Eniolabi Service Hub
## Enterprise Service Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-Latest-orange)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Latest-DC382D)](https://redis.io/)

A comprehensive enterprise service management platform built with modern web technologies. Monitor, manage, and optimize various backend services and infrastructure components through a centralized dashboard.

---

## ✨ **Features**

### **🔧 Service Management**
- Real-time service monitoring
- Health check automation
- Service status tracking
- Click-to-launch service access

### **👥 User Management**
- Role-based access control (Admin, Power User, Guest)
- User profile management
- Avatar upload functionality
- Session management

### **📝 Notes System**
- Personal note-taking
- Categories and tags
- Search functionality
- Rich text editing

### **🔔 Notifications**
- Real-time notifications
- Email alerts
- Customizable preferences
- Notification history

### **📊 Analytics & Monitoring**
- Service performance metrics
- Uptime tracking
- Response time analysis
- System health monitoring

### **🎨 Modern UI/UX**
- Apple-inspired design
- Dark/Light theme support
- Responsive design
- Real-time updates

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 14.2.32** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Heroicons** - Beautiful SVG icons

### **Backend**
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Modern database ORM
- **NextAuth.js** - Authentication
- **Redis** - Caching and real-time features

### **Database**
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions

### **Infrastructure**
- **PM2** - Process management
- **Nginx** - Reverse proxy
- **Docker** - Containerization support

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ (20+ recommended)
- PostgreSQL 13+
- Redis 6+
- Git

### **Installation**

#### **Option 1: Docker Setup (Recommended)**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eniolabi-service-hub.git
   cd eniolabi-service-hub
   ```

2. **Set up Docker environment**
   ```bash
   cp docker.env.template .env
   # Edit .env with your database and Redis passwords
   ```

3. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

#### **Option 2: Manual Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eniolabi-service-hub.git
   cd eniolabi-service-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ **Configuration**

### **Environment Variables**

Create a `.env.local` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5433/database_name"

# Redis Configuration
REDIS_URL="redis://:your_redis_password@localhost:6380"
REDIS_HOST="localhost"
REDIS_PORT="6380"
REDIS_PASSWORD="your_redis_password"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secure-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Service Hub <noreply@yourdomain.com>"

# Application Configuration
NODE_ENV="development"
PORT="3000"
```

### **Database Setup**

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE eniolabi_service_hub;
   CREATE USER your_username WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE eniolabi_service_hub TO your_username;
   ```

2. **Run migrations**
   ```bash
   npx prisma db push
   ```

3. **Seed the database**
   ```bash
   npx prisma db seed
   ```

### **Redis Setup**

1. **Install Redis**
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server
   
   # macOS
   brew install redis
   ```

2. **Start Redis**
   ```bash
   redis-server
   ```

---

## 🏗️ **Project Structure**

```
eniolabi-service-hub/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── features/           # Feature-based modules
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Database, auth, utilities
│   ├── server/            # tRPC backend routers
│   └── shared/            # Shared utilities and types
├── prisma/                # Database schema and migrations
├── docs/                  # Documentation
├── public/                # Static assets
└── scripts/               # Utility scripts
```

---

## 📚 **Documentation**

- **[API Reference](./docs/api/API_REFERENCE.md)** - Complete API documentation
- **[Deployment Guide](./docs/production/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Security Policy](./SECURITY.md)** - Security guidelines
- **[Development Guide](./docs/development/)** - Development documentation

---

## 🔒 **Security**

This project includes comprehensive security features:

- **Authentication**: NextAuth.js with secure sessions
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted database connections
- **Input Validation**: tRPC schema validation
- **Security Headers**: XSS, CSRF protection

**⚠️ Important**: Always change default passwords and secrets before deployment!

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## 🚀 **Deployment**

### **Production Deployment**

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up PM2**
   ```bash
   npm install -g pm2
   cp ecosystem.config.example.js ecosystem.config.js
   # Edit ecosystem.config.js with your configuration
   pm2 start ecosystem.config.js
   ```

3. **Configure Nginx**
   ```bash
   # Add your domain configuration
   sudo nano /etc/nginx/sites-available/yourdomain.com
   ```

4. **Set up SSL**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

See [Deployment Guide](./docs/production/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**Damilare Eniolabi**
- GitHub: [@damoojeje](https://github.com/damoojeje)
- Website: [eniolabi.com](https://eniolabi.com)

---

## 🙏 **Acknowledgments**

- Next.js team for the amazing framework
- tRPC team for type-safe APIs
- Prisma team for the excellent ORM
- All open-source contributors

---

**⭐ If you found this project helpful, please give it a star!**

---

**Last Updated**: October 1, 2025  
**Version**: 3.0.0  
**Status**: Production Ready ✅
