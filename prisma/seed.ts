import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'replaceme123'
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      username: 'admin',
      email: 'admin@eniolabi.com',
      name: 'Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  // Create services to monitor (based on EXISTING_SYSTEM_ANALYSIS.md)
  const services = [
    { 
      name: 'Home Assistant', 
      url: 'https://ha.eniolabi.com', 
      healthEndpoint: '/', 
      category: 'Home Automation', 
      icon: '🏠', 
      port: 8123,
      description: 'Open-source home automation platform that puts local control and privacy first. Manages smart devices, automations, and integrations.'
    },
    { 
      name: 'Portainer', 
      url: 'https://portainer.eniolabi.com', 
      healthEndpoint: '/api/system/status', 
      category: 'Management', 
      icon: '🐳', 
      port: 9443,
      description: 'Lightweight management UI for Docker environments. Provides container management, stack deployment, and monitoring capabilities.'
    },
    { 
      name: 'n8n', 
      url: 'https://n8n.eniolabi.com', 
      healthEndpoint: '/healthz', 
      category: 'Automation', 
      icon: '🔄', 
      port: 5678,
      description: 'Workflow automation tool that connects different services and APIs. Enables complex automation without coding.'
    },
    { 
      name: 'Media Dashboard', 
      url: 'https://media.eniolabi.com', 
      healthEndpoint: '/', 
      category: 'Media', 
      icon: 'mediadashboard', 
      port: 3005,
      description: 'Centralized media management dashboard providing access to all media stack services including Radarr, Sonarr, Lidarr, Bazarr, Overseerr, and more.'
    },
    { 
      name: 'Node-RED', 
      url: 'https://nodered.eniolabi.com', 
      healthEndpoint: '/', 
      category: 'Automation', 
      icon: '🔀', 
      port: 1880,
      description: 'Flow-based development tool for wiring together hardware devices, APIs, and online services in new and interesting ways.'
    },
    { 
      name: 'Wiki.js', 
      url: 'https://wiki.eniolabi.com', 
      healthEndpoint: '/healthz', 
      category: 'Documentation', 
      icon: '📖', 
      port: 3000,
      description: 'Modern, powerful, and extensible wiki software built with Node.js, Git, and Markdown. Perfect for documentation and knowledge management.'
    },
    { 
      name: 'VS Code Server', 
      url: 'https://vscode.eniolabi.com', 
      healthEndpoint: '/healthz', 
      category: 'Development', 
      icon: '💻', 
      port: 8082,
      description: 'Browser-based VS Code environment for remote development. Access your development environment from anywhere.'
    },
    { 
      name: 'File Browser', 
      url: 'https://files.eniolabi.com', 
      healthEndpoint: '/health', 
      category: 'Storage', 
      icon: '📁', 
      port: 8081,
      description: 'Web-based file manager for managing files and folders on the server. Provides upload, download, and file management capabilities.'
    },
    { 
      name: 'Uptime Kuma', 
      url: 'https://status.eniolabi.com', 
      healthEndpoint: '/api/status-page/heartbeat/default', 
      category: 'Monitoring', 
      icon: '📊', 
      port: 3001,
      description: 'Self-hosted monitoring tool for tracking uptime of websites and services. Provides status pages and uptime monitoring.'
    },
    { 
      name: 'Zigbee2MQTT', 
      url: 'https://z2m.eniolabi.com', 
      healthEndpoint: '/', 
      category: 'IoT', 
      icon: '📡', 
      port: 8084,
      description: 'Bridge between Zigbee devices and MQTT. Enables Zigbee devices to communicate with Home Assistant and other IoT platforms.'
    },
    { 
      name: 'WhenNXT', 
      url: 'https://whennxt.eniolabi.com', 
      healthEndpoint: '/health', 
      category: 'Application', 
      icon: '📅', 
      port: 5173,
      description: 'Custom application for managing schedules and events. Provides calendar functionality and event management capabilities.'
    },
    { 
      name: 'Nginx UI', 
      url: 'https://nginx.eniolabi.com', 
      healthEndpoint: '/', 
      category: 'Management', 
      icon: '🌐', 
      port: 9000,
      description: 'Web-based interface for managing Nginx configurations. Provides visual configuration management and monitoring.'
    },
  ]

  for (const service of services) {
    // Check if service exists first
    const existingService = await prisma.service.findFirst({
      where: { name: service.name }
    })
    
    if (existingService) {
      await prisma.service.update({
        where: { id: existingService.id },
        data: service,
      })
    } else {
      await prisma.service.create({
        data: service,
      })
    }
  }

  console.log('Database seeded successfully')
  console.log('Admin user:', adminUser)
  console.log('Services created:', services.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })