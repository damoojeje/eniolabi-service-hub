import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { Status } from '@prisma/client'
import { publishServiceStatusUpdate, publishHealthCheckTrigger } from '@/lib/redis'
import { processServiceStatusChange } from '@/lib/notifications'
import {
  findServiceById,
  getServicesWithCurrentStatus,
  createServiceStatus,
  errors,
  errorHelpers,
  commonSchemas,
  objectSchemas
} from '@/shared'

// Service health checker function
async function checkServiceHealth(url: string, healthEndpoint: string = '', timeoutSeconds: number = 10): Promise<{
  status: Status
  responseTime: number
  statusCode?: number
  errorMessage?: string
}> {
  const startTime = Date.now()
  const fullUrl = healthEndpoint ? `${url}${healthEndpoint}` : url
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Eniolabi-Service-Hub/1.0',
        'Accept': 'application/json, text/plain, */*',
      },
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        status: Status.ONLINE,
        responseTime,
        statusCode: response.status,
      }
    } else if (response.status === 405) {
      // Method not allowed - service is running but doesn't accept GET
      return {
        status: Status.ONLINE,
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Method Not Allowed (Service Running)`,
      }
    } else if (response.status === 401) {
      // Authentication required - service is running but needs auth
      return {
        status: Status.ONLINE,
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Authentication Required`,
      }
    } else if (response.status === 404) {
      // Not found - might be wrong endpoint but service could be running
      return {
        status: Status.WARNING,
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Endpoint Not Found`,
      }
    } else if (response.status >= 400 && response.status < 500) {
      return {
        status: Status.ERROR,
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      }
    } else {
      return {
        status: Status.WARNING,
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          status: Status.OFFLINE,
          responseTime,
          errorMessage: `Timeout after ${timeoutSeconds}s`,
        }
      }
      
      return {
        status: Status.OFFLINE,
        responseTime,
        errorMessage: error.message,
      }
    }
    
    return {
      status: 'OFFLINE',
      responseTime,
      errorMessage: 'Unknown error',
    }
  }
}

export const servicesRouter = createTRPCRouter({
  // Get all services with latest status
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await getServicesWithCurrentStatus(ctx.db)
  }),

  // Get service by ID with recent status history
  getById: protectedProcedure
    .input(commonSchemas.id)
    .query(async ({ ctx, input }) => {
      const service = await findServiceById(ctx.db, input.id, {
        includeStatusHistory: true,
        statusLimit: 48
      })

      if (!service) {
        throw errors.serviceNotFound()
      }

      return service
    }),

  // Perform health check on a specific service
  checkHealth: protectedProcedure
    .input(commonSchemas.id)
    .mutation(async ({ ctx, input }) => {
      const service = await findServiceById(ctx.db, input.id)

      if (!service) {
        throw errors.serviceNotFound()
      }

      const healthResult = await checkServiceHealth(
        service.url,
        service.healthEndpoint || '',
        service.timeoutSeconds
      )

      // Get previous status for comparison
      const previousStatus = await ctx.db.serviceStatus.findFirst({
        where: { serviceId: service.id },
        orderBy: { checkedAt: 'desc' },
        take: 1,
      })

      // Save the health check result
      const statusRecord = await createServiceStatus(
        ctx.db,
        service.id,
        healthResult.status,
        healthResult.responseTime,
        healthResult.statusCode,
        healthResult.errorMessage
      )

      // Publish real-time update
      await publishServiceStatusUpdate(service.id, {
        ...statusRecord,
        serviceName: service.name,
        serviceIcon: service.icon,
      })

      // Process notifications (fire and forget)
      processServiceStatusChange(service, previousStatus?.status || null, statusRecord)
        .catch(error => {
          console.error('Failed to process service notification:', error)
        })

      return {
        service,
        status: statusRecord,
      }
    }),

  // Perform health check on all services
  checkAllHealth: protectedProcedure.mutation(async ({ ctx }) => {
    // Trigger health check event
    await publishHealthCheckTrigger()

    const services = await ctx.db.service.findMany({
      where: { isActive: true },
    })

    const results = await Promise.allSettled(
      services.map(async (service) => {
        const healthResult = await checkServiceHealth(
          service.url,
          service.healthEndpoint || '',
          service.timeoutSeconds
        )

        // Get previous status for comparison
        const previousStatus = await ctx.db.serviceStatus.findFirst({
          where: { serviceId: service.id },
          orderBy: { checkedAt: 'desc' },
          take: 1,
        })

        const statusRecord = await createServiceStatus(
          ctx.db,
          service.id,
          healthResult.status,
          healthResult.responseTime,
          healthResult.statusCode,
          healthResult.errorMessage
        )

        // Publish real-time update for each service
        await publishServiceStatusUpdate(service.id, {
          ...statusRecord,
          serviceName: service.name,
          serviceIcon: service.icon,
        })

        // Process notifications (fire and forget)
        processServiceStatusChange(service, previousStatus?.status || null, statusRecord)
          .catch(error => {
            console.error('Failed to process service notification:', error)
          })

        return {
          service,
          status: statusRecord,
        }
      })
    )

    const successful = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value)

    const failed = results
      .filter((result) => result.status === 'rejected')
      .map((result) => ({
        error: (result as PromiseRejectedResult).reason,
      }))

    return {
      successful,
      failed,
      total: services.length,
    }
  }),

  // Create new service (admin only)
  create: adminProcedure
    .input(objectSchemas.createService)
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.create({
        data: {
          name: input.name,
          url: input.url,
          description: input.description,
          category: input.category,
          healthEndpoint: input.healthCheckUrl,
          timeoutSeconds: input.timeout ? Math.floor(input.timeout / 1000) : 30,
          isActive: true,
          serviceStatus: {
            create: {
              status: input.status,
              responseTime: 0,
              checkedAt: new Date(),
            }
          }
        },
        include: {
          serviceStatus: true
        }
      })

      // Publish update to Redis
      // await publishServiceUpdate(ctx.redis, 'service_created', service) // This line was removed from the new_code, so it's removed here.

      return service
    }),

  // Update existing service (admin only)
  update: adminProcedure
    .input(objectSchemas.updateService)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      const service = await ctx.db.service.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.url && { url: updateData.url }),
          ...(updateData.description && { description: updateData.description }),
          ...(updateData.category && { category: updateData.category }),
          ...(updateData.healthCheckUrl && { healthEndpoint: updateData.healthCheckUrl }),
          ...(updateData.timeout && { timeoutSeconds: Math.floor(updateData.timeout / 1000) }),
        },
        include: {
          serviceStatus: true
        }
      })

      // If status was updated, create a new status record
      if (updateData.status) {
        await ctx.db.serviceStatus.create({
          data: {
            serviceId: id,
            status: updateData.status,
            responseTime: 0,
            checkedAt: new Date(),
          }
        })
      }

      // Publish update to Redis
      // await publishServiceUpdate(ctx.redis, 'service_updated', service) // This line was removed from the new_code, so it's removed here.

      return service
    }),

  // Delete service (admin only)
  delete: adminProcedure
    .input(commonSchemas.id)
    .mutation(async ({ ctx, input }) => {
      // Soft delete by setting isActive to false
      const service = await ctx.db.service.update({
        where: { id: input },
        data: { isActive: false }
      })

      // Publish update to Redis
      // await publishServiceUpdate(ctx.redis, 'service_deleted', service) // This line was removed from the new_code, so it's removed here.

      return service
    }),

  // Start service (Admin and Power User only)
  startService: protectedProcedure
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      errorHelpers.requireRole(ctx.session.user.role, ['ADMIN', 'POWER_USER'])

      const service = await findServiceById(ctx.db, input.serviceId)

      if (!service) {
        throw errors.serviceNotFound()
      }

      // In a real implementation, this would call the actual service management API
      // For now, we'll simulate the action and update the status
      const newStatus = await ctx.db.serviceStatus.create({
        data: {
          serviceId: input.serviceId,
          status: Status.ONLINE,
          responseTime: 150, // Simulated response time
          statusCode: 200,
          checkedAt: new Date(),
          errorMessage: null,
        }
      })

      // Service schema doesn't have currentStatusId or lastStartedAt fields
      // The status is tracked via the ServiceStatus records

      // Publish status update
      await publishServiceStatusUpdate(input.serviceId, {
        ...newStatus,
        serviceName: service.name,
        serviceIcon: service.icon,
      })

      return { success: true, message: 'Service started successfully' }
    }),

  // Stop service (Admin and Power User only)
  stopService: protectedProcedure
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      errorHelpers.requireRole(ctx.session.user.role, ['ADMIN', 'POWER_USER'])

      const service = await findServiceById(ctx.db, input.serviceId)

      if (!service) {
        throw errors.serviceNotFound()
      }

      // In a real implementation, this would call the actual service management API
      // For now, we'll simulate the action and update the status
      const newStatus = await ctx.db.serviceStatus.create({
        data: {
          serviceId: input.serviceId,
          status: Status.OFFLINE,
          responseTime: 0,
          statusCode: null,
          checkedAt: new Date(),
          errorMessage: 'Service stopped by user',
        }
      })

      // Service schema doesn't have currentStatusId or lastStoppedAt fields
      // The status is tracked via the ServiceStatus records

      // Publish status update
      await publishServiceStatusUpdate(input.serviceId, {
        ...newStatus,
        serviceName: service.name,
        serviceIcon: service.icon,
      })

      return { success: true, message: 'Service stopped successfully' }
    }),

  // Restart service (Admin and Power User only)
  restartService: protectedProcedure
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      errorHelpers.requireRole(ctx.session.user.role, ['ADMIN', 'POWER_USER'])

      const service = await findServiceById(ctx.db, input.serviceId)

      if (!service) {
        throw errors.serviceNotFound()
      }

      // In a real implementation, this would call the actual service management API
      // For now, we'll simulate the action and update the status
      const newStatus = await ctx.db.serviceStatus.create({
        data: {
          serviceId: input.serviceId,
          status: Status.ONLINE,
          responseTime: 120, // Simulated response time
          statusCode: 200,
          checkedAt: new Date(),
          errorMessage: null,
        }
      })

      // Service schema doesn't have currentStatusId or lastRestartedAt fields
      // The status is tracked via the ServiceStatus records

      // Publish status update
      await publishServiceStatusUpdate(input.serviceId, {
        ...newStatus,
        serviceName: service.name,
        serviceIcon: service.icon,
      })

      return { success: true, message: 'Service restarted successfully' }
    }),

  // Get service statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Get all active services with their latest status
    const services = await ctx.db.service.findMany({
      where: { isActive: true },
      include: {
        serviceStatus: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
      },
    })

    const total = services.length
    let online = 0, warning = 0, error = 0, offline = 0

    services.forEach(service => {
      const latestStatus = service.serviceStatus[0]?.status
      switch (latestStatus) {
        case 'ONLINE':
          online++
          break
        case 'WARNING':
          warning++
          break
        case 'ERROR':
          error++
          break
        case 'OFFLINE':
        default:
          offline++
          break
      }
    })

    return {
      total,
      online,
      warning,
      error,
      offline,
      uptime: total > 0 ? ((online / total) * 100).toFixed(1) : '0.0',
    }
  }),

  // Get service status history
  getStatusHistory: protectedProcedure
    .input(objectSchemas.getStatusHistory)
    .query(async ({ ctx, input }) => {
      const { serviceId, timeRange } = input

      // Calculate the start date based on time range
      const now = new Date()
      let startDate: Date

      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      }

      const history = await ctx.db.serviceStatus.findMany({
        where: {
          serviceId,
          checkedAt: {
            gte: startDate,
          },
        },
        orderBy: {
          checkedAt: 'desc',
        },
        take: timeRange === '1h' ? 120 : timeRange === '24h' ? 288 : 500, // Limit results
      })

      return history
    }),

  // Get system statistics
  getSystemStats: protectedProcedure.query(async ({ ctx }) => {
    // Get time range for recent checks (last 2 hours instead of 5 minutes)
    const recentTimeWindow = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    const [totalServices, recentStatusChecks] = await Promise.all([
      ctx.db.service.count({ where: { isActive: true } }),
      ctx.db.serviceStatus.findMany({
        where: {
          service: { isActive: true },
          checkedAt: { gte: recentTimeWindow }
        },
        include: {
          service: { select: { id: true, name: true } }
        },
        orderBy: { checkedAt: 'desc' }
      })
    ])

    // Get latest status for each service
    const serviceStatusMap = new Map()
    recentStatusChecks.forEach(check => {
      if (!serviceStatusMap.has(check.serviceId)) {
        serviceStatusMap.set(check.serviceId, check)
      }
    })

    const latestStatuses = Array.from(serviceStatusMap.values())
    const onlineServices = latestStatuses.filter(s => s.status === 'ONLINE').length
    const warningServices = latestStatuses.filter(s => s.status === 'WARNING').length
    const errorServices = latestStatuses.filter(s => s.status === 'ERROR').length
    const offlineServices = latestStatuses.filter(s => s.status === 'OFFLINE').length
    const unknownServices = totalServices - latestStatuses.length // Services without recent status

    // Calculate average response time
    const validResponseTimes = recentStatusChecks
      .filter(check => check.responseTime !== null)
      .map(check => check.responseTime as number)
    const avgResponseTime = validResponseTimes.length > 0
      ? Math.round(validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length)
      : 0

    return {
      totalServices,
      onlineServices,
      warningServices,
      errorServices,
      offlineServices,
      unknownServices, // Services without recent status checks
      avgResponseTime,
      totalStatusChecks: recentStatusChecks.length,
      lastUpdated: new Date()
    }
  }),

  // Get service templates (admin only)
  getTemplates: adminProcedure.query(async ({ ctx }) => {
    // Return predefined templates for common service types
    return [
      {
        id: 'web-service',
        name: 'Web Service',
        description: 'Standard web application or website',
        category: 'web',
        icon: '🌐',
        defaultConfig: {
          expectedResponseTime: 3000,
          timeoutSeconds: 10,
          retryAttempts: 3,
          enableAlerts: true,
          followRedirects: true,
          validateSSL: true
        },
        requiredFields: ['name', 'url', 'description']
      },
      {
        id: 'api-service',
        name: 'API Service',
        description: 'REST API or web service endpoint',
        category: 'api',
        icon: '🔌',
        defaultConfig: {
          expectedResponseTime: 2000,
          timeoutSeconds: 15,
          retryAttempts: 2,
          enableAlerts: true,
          followRedirects: false,
          validateSSL: true
        },
        requiredFields: ['name', 'url', 'description', 'healthCheckUrl']
      },
      {
        id: 'database-service',
        name: 'Database Service',
        description: 'Database server or data service',
        category: 'database',
        icon: '💾',
        defaultConfig: {
          expectedResponseTime: 1000,
          timeoutSeconds: 30,
          retryAttempts: 3,
          enableAlerts: true,
          authRequired: true
        },
        requiredFields: ['name', 'url', 'description']
      }
    ]
  }),

  // Get service groups (admin only)
  getGroups: adminProcedure.query(async ({ ctx }) => {
    // For now, return empty array - in a full implementation this would be stored in DB
    return []
  }),

  // Get service metrics
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const services = await ctx.db.service.findMany({
      where: { isActive: true },
      include: {
        serviceStatus: {
          orderBy: { checkedAt: 'desc' },
          take: 100 // Get last 100 status checks for metrics calculation
        }
      }
    })

    return services.map(service => {
      const statuses = service.serviceStatus
      const totalChecks = statuses.length
      const successfulChecks = statuses.filter(s => s.status === 'ONLINE').length
      const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0
      const avgResponseTime = statuses.length > 0 
        ? statuses.reduce((sum, s) => sum + s.responseTime, 0) / statuses.length 
        : 0

      return {
        serviceId: service.id,
        serviceName: service.name,
        uptime,
        avgResponseTime,
        successRate: uptime,
        totalChecks,
        successfulChecks,
        failedChecks: totalChecks - successfulChecks,
        lastCheck: statuses[0]?.checkedAt || service.createdAt,
        status: statuses[0]?.status || 'OFFLINE'
      }
    })
  }),

  // Create service group (admin only)
  createGroup: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().min(1).max(500),
      color: z.string().min(1),
      services: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // For now, just return a mock response
      // In a full implementation, this would create a group in the database
      return {
        id: `group_${Date.now()}`,
        ...input
      }
    }),

  // Bulk update services (admin only)
  bulkUpdate: adminProcedure
    .input(z.object({
      serviceIds: z.array(z.string()),
      updates: z.object({
        isActive: z.boolean().optional(),
        category: z.string().optional(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.service.updateMany({
        where: {
          id: { in: input.serviceIds }
        },
        data: input.updates
      })

      return {
        updated: result.count
      }
    }),
})