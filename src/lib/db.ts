import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = 
  globalForPrisma.prisma ?? 
  new PrismaClient({
    // Database connection configuration
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Connection pool configuration for production
    ...(process.env.NODE_ENV === 'production' && {
      log: ['warn', 'error'],
    }),

    // Development logging
    ...(process.env.NODE_ENV !== 'production' && {
      log: ['query', 'info', 'warn', 'error'],
    }),
  })

// Connection pool settings (handled by environment variables)
// Recommended settings for production:
// DATABASE_URL="postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20"

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing database connections...')
  await db.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Closing database connections...')
  await db.$disconnect()
  process.exit(0)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db