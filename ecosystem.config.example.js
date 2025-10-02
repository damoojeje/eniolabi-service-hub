module.exports = {
  apps: [
    {
      name: 'eniolabi-service-hub',
      script: 'npm',
      args: 'run start', // Production mode
      cwd: '/var/www/eniolabi.com',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        NEXTAUTH_URL: 'https://yourdomain.com', // Replace with your domain
        NEXTAUTH_SECRET: 'your-super-secure-secret-key-here', // Generate a secure secret
        NEXTAUTH_JWT_SECRET: 'your-jwt-secret-here', // Generate a secure JWT secret
        DATABASE_URL: 'postgresql://username:password@localhost:5433/database_name', // Replace with your DB credentials
        REDIS_URL: 'redis://:your_redis_password@localhost:6380', // Replace with your Redis credentials
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6380',
        REDIS_PASSWORD: 'your_redis_password', // Replace with your Redis password
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        NEXT_TELEMETRY_DISABLED: '1',
      },
      
      // Production settings
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health checks
      health_check_grace_period: 3000,
      health_check_interval: 30000,
    }
  ]
}
