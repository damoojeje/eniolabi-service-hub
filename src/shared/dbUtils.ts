/**
 * Shared database query utilities
 * Eliminates duplication of common database operations across tRPC routers
 */

import { PrismaClient, Status } from '@prisma/client'

/**
 * Find user by ID with optional includes
 */
export function findUserById(
  db: PrismaClient, 
  id: string, 
  include?: {
    notificationPreferences?: boolean
  }
) {
  return db.user.findUnique({
    where: { id },
    include
  })
}

/**
 * Find service by ID with optional includes
 */
export function findServiceById(
  db: PrismaClient,
  id: string,
  include?: {
    serviceStatus?: boolean | { orderBy: any, take?: number }
    currentStatus?: boolean
  }
) {
  return db.service.findUnique({
    where: { id },
    include
  })
}

/**
 * Find user by username or email
 */
export function findUserByUsernameOrEmail(
  db: PrismaClient,
  username: string,
  email: string
) {
  return db.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  })
}

/**
 * Find notification by ID and user
 */
export function findNotificationByIdAndUser(
  db: PrismaClient,
  id: string,
  userId: string
) {
  return db.notification.findFirst({
    where: {
      id,
      userId,
    },
  })
}

/**
 * Get services with current status
 */
export function getServicesWithCurrentStatus(db: PrismaClient, isActive = true) {
  return db.service.findMany({
    where: { isActive },
    include: {
      serviceStatus: {
        orderBy: { checkedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  }).then(services => 
    services.map(service => ({
      ...service,
      currentStatus: service.serviceStatus[0] || null,
    }))
  )
}

/**
 * Create service status record
 */
export function createServiceStatus(
  db: PrismaClient,
  serviceId: string,
  status: Status,
  responseTime?: number,
  statusCode?: number,
  errorMessage?: string | null
) {
  return db.serviceStatus.create({
    data: {
      serviceId,
      status,
      responseTime: responseTime || null,
      statusCode: statusCode || null,
      errorMessage,
    },
  })
}

/**
 * Count unread notifications for user
 */
export function countUnreadNotifications(db: PrismaClient, userId: string) {
  return db.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })
}