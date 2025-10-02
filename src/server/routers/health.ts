/**
 * Health Monitoring tRPC Router
 * System health tracking and monitoring endpoints
 */

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Validation Schemas
const healthFiltersSchema = z.object({
  components: z.array(z.string()).optional(),
  statuses: z.array(z.enum(['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE'])).optional(),
  severities: z.array(z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL'])).optional(),
  timeRange: z.string().optional().default('24h'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  includeResolved: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional()
})

const healthCheckSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(500).optional().default(''),
  type: z.enum(['HTTP', 'TCP', 'DATABASE', 'CUSTOM']),
  target: z.string().min(1, 'Target is required'),
  method: z.string().optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  timeout: z.number().min(1000).max(60000).default(5000),
  interval: z.number().min(30).max(3600).default(60),
  retryCount: z.number().min(0).max(5).default(1),
  expectedStatus: z.number().optional(),
  expectedResponse: z.string().optional(),
  isEnabled: z.boolean().default(true),
  tags: z.array(z.string()).default([])
})

const incidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).default('MAJOR'),
  affectedComponents: z.array(z.string()).default([]),
  affectedServices: z.array(z.string()).default([]),
  impactedUsers: z.number().min(0).default(0),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).default([])
})

const maintenanceWindowSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000),
  type: z.enum(['PLANNED', 'EMERGENCY']).default('PLANNED'),
  startTime: z.date(),
  endTime: z.date(),
  affectedServices: z.array(z.string()).default([]),
  impactLevel: z.enum(['NO_IMPACT', 'MINIMAL', 'MODERATE', 'SIGNIFICANT']).default('MINIMAL'),
  notificationsSent: z.boolean().default(false)
})

export const healthRouter = createTRPCRouter({
  // Get overall system health
  getSystemHealth: protectedProcedure
    .input(z.object({
      includeComponents: z.boolean().default(true),
      timeRange: z.string().default('1h')
    }))
    .query(async ({ ctx, input }) => {
      const { includeComponents, timeRange } = input
      
      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200
      }[timeRange] || 60
      
      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Get services and their status
      const services = await ctx.db.service.findMany({
        where: { isActive: true },
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime }
            },
            orderBy: { checkedAt: 'desc' },
            take: 1
          }
        }
      })

      // Calculate system metrics
      const totalServices = services.length
      const healthyServices = services.filter(s => 
        s.serviceStatus.length > 0 && s.serviceStatus[0].status === 'ONLINE'
      ).length
      const degradedServices = services.filter(s => 
        s.serviceStatus.length > 0 && s.serviceStatus[0].status === 'WARNING'
      ).length
      const failedServices = services.filter(s => 
        s.serviceStatus.length === 0 || 
        ['ERROR', 'OFFLINE'].includes(s.serviceStatus[0].status)
      ).length

      // Get recent status checks for response time calculation
      const recentChecks = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { gte: startTime },
          service: { isActive: true }
        },
        select: {
          responseTime: true,
          status: true,
          serviceId: true
        }
      })

      const validResponseTimes = recentChecks
        .filter(c => c.responseTime !== null)
        .map(c => c.responseTime as number)
      
      const avgResponseTime = validResponseTimes.length > 0 
        ? Math.round(validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length)
        : 0

      const totalRequests = recentChecks.length
      const successfulRequests = recentChecks.filter(c => c.status === 'ONLINE').length
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

      // Calculate overall health score
      const uptimeScore = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0
      const responseScore = avgResponseTime < 1000 ? 100 : Math.max(0, 100 - (avgResponseTime - 1000) / 100)
      const healthScore = Math.round((uptimeScore * 0.6) + (responseScore * 0.2) + (successRate * 0.2))

      // Determine overall status
      let overallStatus: 'HEALTHY' | 'DEGRADED' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE'
      if (healthScore >= 95) overallStatus = 'HEALTHY'
      else if (healthScore >= 80) overallStatus = 'DEGRADED'
      else if (healthScore >= 50) overallStatus = 'PARTIAL_OUTAGE'
      else overallStatus = 'MAJOR_OUTAGE'

      // Build component health data
      const components = includeComponents ? services.map(service => {
        const latestStatus = service.serviceStatus[0]
        const componentStatus = latestStatus ? {
          'ONLINE': 'OPERATIONAL' as const,
          'WARNING': 'DEGRADED_PERFORMANCE' as const,
          'ERROR': 'PARTIAL_OUTAGE' as const,
          'OFFLINE': 'MAJOR_OUTAGE' as const
        }[latestStatus.status] : 'MAJOR_OUTAGE' as const

        // Calculate component health score
        const hasStatus = latestStatus !== undefined
        const isHealthy = hasStatus && latestStatus.status === 'ONLINE'
        const responseTime = latestStatus?.responseTime || 0
        const responseScore = responseTime < 1000 ? 100 : Math.max(0, 100 - (responseTime - 1000) / 100)
        const componentHealthScore = isHealthy ? Math.round(responseScore) : 0

        return {
          id: service.id,
          name: service.name,
          type: 'SERVICE' as const,
          status: componentStatus,
          healthScore: componentHealthScore,
          description: service.description || undefined,
          lastChecked: latestStatus?.checkedAt || new Date(),
          responseTime: latestStatus?.responseTime || undefined,
          errorRate: isHealthy ? 0 : 100,
          uptime: isHealthy ? 100 : 0,
          dependencies: [],
          metrics: {
            availability: isHealthy ? 100 : 0,
            responseTime: {
              current: responseTime,
              avg: responseTime,
              p95: responseTime,
              p99: responseTime
            },
            throughput: {
              current: 0,
              avg: 0,
              peak: 0
            },
            errorRate: {
              current: isHealthy ? 0 : 100,
              avg: isHealthy ? 0 : 100,
              threshold: 5
            }
          },
          issues: []
        }
      }) : []

      return {
        overall: overallStatus,
        score: healthScore,
        lastUpdated: new Date(),
        components,
        metrics: {
          totalServices,
          healthyServices,
          degradedServices,
          failedServices,
          avgResponseTime,
          totalRequests,
          successRate: Math.round(successRate * 100) / 100,
          activeAlerts: 0, // Placeholder
          criticalAlerts: 0, // Placeholder
          systemLoad: 0, // Placeholder
          memoryUsage: 0, // Placeholder
          diskUsage: 0 // Placeholder
        },
        incidents: [], // Placeholder
        uptime: {
          current: {
            uptime: uptimeScore,
            downtime: 100 - uptimeScore,
            startTime: startTime
          },
          daily: {
            today: uptimeScore,
            yesterday: 0,
            last7Days: Array(7).fill(uptimeScore)
          },
          monthly: {
            thisMonth: uptimeScore,
            lastMonth: 0,
            last12Months: Array(12).fill(uptimeScore)
          },
          yearly: {
            thisYear: uptimeScore,
            lastYear: 0
          }
        }
      }
    }),

  // Get component health details
  getComponentHealth: protectedProcedure
    .input(z.object({
      componentId: z.string(),
      timeRange: z.string().default('24h')
    }))
    .query(async ({ ctx, input }) => {
      const { componentId, timeRange } = input

      // For now, treat componentId as serviceId
      const service = await ctx.db.service.findUnique({
        where: { id: componentId },
        include: {
          serviceStatus: {
            orderBy: { checkedAt: 'desc' },
            take: 100
          }
        }
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Component not found'
        })
      }

      const latestStatus = service.serviceStatus[0]
      const isHealthy = latestStatus && latestStatus.status === 'ONLINE'
      const responseTime = latestStatus?.responseTime || 0

      return {
        id: service.id,
        name: service.name,
        type: 'SERVICE' as const,
        status: isHealthy ? 'OPERATIONAL' as const : 'MAJOR_OUTAGE' as const,
        healthScore: isHealthy ? 100 : 0,
        description: service.description || undefined,
        lastChecked: latestStatus?.checkedAt || new Date(),
        responseTime: latestStatus?.responseTime || undefined,
        errorRate: isHealthy ? 0 : 100,
        uptime: isHealthy ? 100 : 0,
        dependencies: [],
        metrics: {
          availability: isHealthy ? 100 : 0,
          responseTime: {
            current: responseTime,
            avg: responseTime,
            p95: responseTime,
            p99: responseTime
          },
          throughput: {
            current: 0,
            avg: 0,
            peak: 0
          },
          errorRate: {
            current: isHealthy ? 0 : 100,
            avg: isHealthy ? 0 : 100,
            threshold: 5
          }
        },
        issues: []
      }
    }),

  // Get health trends
  getHealthTrends: protectedProcedure
    .input(z.object({
      timeRange: z.string().default('24h'),
      components: z.array(z.string()).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange, components } = input

      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200
      }[timeRange] || 1440

      const intervalMinutes = {
        '1h': 5,
        '6h': 15,
        '24h': 60,
        '7d': 360,
        '30d': 1440
      }[timeRange] || 60

      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Get status data for trend calculation
      const serviceFilter: any = { isActive: true }
      if (components && components.length > 0) {
        serviceFilter.id = { in: components }
      }

      const statusData = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { gte: startTime, lte: now },
          service: serviceFilter
        },
        include: {
          service: { select: { name: true } }
        },
        orderBy: { checkedAt: 'asc' }
      })

      // Group data by time intervals
      const intervals = Math.ceil(timeRangeMinutes / intervalMinutes)
      const trends = []

      for (let i = 0; i < intervals; i++) {
        const bucketStart = new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000)
        const bucketEnd = new Date(bucketStart.getTime() + intervalMinutes * 60 * 1000)
        
        const bucketData = statusData.filter(d => 
          d.checkedAt >= bucketStart && d.checkedAt < bucketEnd
        )

        const totalChecks = bucketData.length
        const successfulChecks = bucketData.filter(d => d.status === 'ONLINE').length
        const availability = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0
        
        const validResponseTimes = bucketData
          .filter(d => d.responseTime !== null)
          .map(d => d.responseTime as number)
        
        const avgResponseTime = validResponseTimes.length > 0
          ? validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length
          : 0

        const errorRate = totalChecks > 0 ? ((totalChecks - successfulChecks) / totalChecks) * 100 : 0

        // Calculate component-specific health
        const componentHealth: Record<string, number> = {}
        const serviceGroups = bucketData.reduce((acc, d) => {
          const serviceName = d.service?.name || 'Unknown'
          if (!acc[serviceName]) acc[serviceName] = []
          acc[serviceName].push(d)
          return acc
        }, {} as Record<string, any[]>)

        Object.entries(serviceGroups).forEach(([serviceName, serviceData]) => {
          const serviceSuccess = serviceData.filter(d => d.status === 'ONLINE').length
          componentHealth[serviceName] = serviceData.length > 0 ? (serviceSuccess / serviceData.length) * 100 : 0
        })

        trends.push({
          timestamp: bucketStart,
          overallHealth: Math.round(availability),
          componentHealth,
          activeIncidents: 0, // Placeholder
          responseTime: Math.round(avgResponseTime),
          errorRate: Math.round(errorRate * 100) / 100,
          availability: Math.round(availability * 100) / 100
        })
      }

      return trends
    }),

  // Get active incidents (placeholder implementation)
  getActiveIncidents: protectedProcedure
    .query(async ({ ctx }) => {
      const incidents = await ctx.db.incident.findMany({
        where: {
          status: {
            not: 'RESOLVED'
          }
        },
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          },
          assignee: {
            select: {
              username: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return incidents
    }),

  // Create incident (admin only) - placeholder
  createIncident: adminProcedure
    .input(incidentSchema)
    .mutation(async ({ ctx, input }) => {
      const incident = await ctx.db.incident.create({
        data: {
          title: input.title,
          description: input.description,
          severity: input.severity,
          affectedComponents: input.affectedComponents,
          affectedServices: input.affectedServices,
          impactedUsers: input.impactedUsers,
          assignedTo: input.assignedTo,
          tags: input.tags,
          createdBy: ctx.session.user.id
        },
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          },
          assignee: {
            select: {
              username: true,
              name: true
            }
          }
        }
      })
      
      return incident
    }),

  // Get maintenance windows
  getMaintenanceWindows: protectedProcedure
    .input(z.object({
      upcoming: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const { upcoming, limit } = input
      
      const now = new Date()
      const where = upcoming 
        ? { 
            startTime: { gte: now },
            status: { not: 'CANCELLED' }
          }
        : {}

      const maintenanceWindows = await ctx.db.maintenanceWindow.findMany({
        where,
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          }
        },
        orderBy: { startTime: upcoming ? 'asc' : 'desc' },
        take: limit
      })

      return maintenanceWindows
    }),

  // Schedule maintenance window (admin only) - placeholder
  scheduleMaintenanceWindow: adminProcedure
    .input(maintenanceWindowSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate dates
      if (input.endTime <= input.startTime) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End time must be after start time'
        })
      }

      const maintenanceWindow = await ctx.db.maintenanceWindow.create({
        data: {
          title: input.title,
          description: input.description,
          type: input.type,
          startTime: input.startTime,
          endTime: input.endTime,
          affectedServices: input.affectedServices,
          impactLevel: input.impactLevel,
          notificationsSent: input.notificationsSent,
          createdBy: ctx.session.user.id
        },
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          }
        }
      })

      return maintenanceWindow
    }),

  // Get health issues/alerts
  getHealthIssues: protectedProcedure
    .input(healthFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { timeRange, includeResolved, severities, components } = input

      // For now, generate health issues from service statuses that indicate problems
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200
      }[timeRange] || 1440

      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      let serviceFilter: any = { isActive: true }
      if (components && components.length > 0) {
        serviceFilter.id = { in: components }
      }

      // Get services with problematic statuses
      const problematicServices = await ctx.db.service.findMany({
        where: serviceFilter,
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime },
              status: { in: ['ERROR', 'OFFLINE', 'WARNING'] }
            },
            orderBy: { checkedAt: 'desc' },
            take: 5
          }
        }
      })

      // Transform service issues to health issues
      const issues = problematicServices.flatMap(service =>
        service.serviceStatus.map(status => ({
          id: `issue_${status.id}`,
          componentId: service.id,
          type: status.status === 'OFFLINE' ? 'AVAILABILITY' as const :
                status.status === 'ERROR' ? 'ERROR' as const : 'PERFORMANCE' as const,
          severity: status.status === 'OFFLINE' ? 'CRITICAL' as const :
                   status.status === 'ERROR' ? 'ERROR' as const : 'WARNING' as const,
          title: `${service.name} is ${status.status.toLowerCase()}`,
          description: status.errorMessage || `Service ${service.name} is experiencing ${status.status.toLowerCase()} status`,
          detectedAt: status.checkedAt,
          impact: status.status === 'OFFLINE' ? 'HIGH' as const :
                 status.status === 'ERROR' ? 'MEDIUM' as const : 'LOW' as const,
          isAcknowledged: false
        }))
      )

      // Filter by severity if specified
      const filteredIssues = severities && severities.length > 0
        ? issues.filter(issue => severities.includes(issue.severity))
        : issues

      return filteredIssues.slice(0, 50) // Limit results
    }),

  // Acknowledge health issue
  acknowledgeIssue: protectedProcedure
    .input(z.object({ issueId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Placeholder implementation
      return {
        success: true,
        message: 'Issue acknowledged',
        acknowledgedBy: ctx.session.user.username,
        acknowledgedAt: new Date()
      }
    }),

  // Get system uptime
  getSystemUptime: protectedProcedure
    .input(z.object({
      period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('daily')
    }))
    .query(async ({ ctx, input }) => {
      const { period } = input

      // Calculate uptime based on service status history
      const now = new Date()
      let startTime: Date
      let intervals: Date[] = []

      switch (period) {
        case 'daily':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          for (let i = 0; i < 7; i++) {
            intervals.push(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
          }
          break
        case 'weekly':
          startTime = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) // Last 12 weeks
          for (let i = 0; i < 12; i++) {
            intervals.push(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000))
          }
          break
        case 'monthly':
          startTime = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
          for (let i = 0; i < 12; i++) {
            intervals.push(new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000))
          }
          break
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last day
          intervals = [now]
      }

      const statusData = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { gte: startTime, lte: now },
          service: { isActive: true }
        },
        select: {
          status: true,
          checkedAt: true
        },
        orderBy: { checkedAt: 'asc' }
      })

      // Calculate uptime for each interval
      const uptimeData = intervals.map(intervalEnd => {
        const intervalStart = new Date(intervalEnd.getTime() - (period === 'daily' ? 24 * 60 * 60 * 1000 :
                                                                 period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                                                                 30 * 24 * 60 * 60 * 1000))
        
        const intervalData = statusData.filter(d => 
          d.checkedAt >= intervalStart && d.checkedAt <= intervalEnd
        )

        const totalChecks = intervalData.length
        const successfulChecks = intervalData.filter(d => d.status === 'ONLINE').length
        const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100

        return {
          period: intervalEnd,
          uptime: Math.round(uptime * 100) / 100,
          totalChecks,
          successfulChecks
        }
      })

      return uptimeData.reverse() // Return chronological order
    }),

  // Get detailed system metrics
  getSystemMetrics: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get all services and their latest status
      const services = await ctx.db.service.findMany({
        include: {
          serviceStatus: {
            orderBy: { checkedAt: 'desc' },
            take: 1
          }
        }
      })

      // Calculate metrics
      const totalServices = services.length
      const onlineServices = services.filter(s => 
        s.serviceStatus.length > 0 && s.serviceStatus[0].status === 'ONLINE'
      ).length
      const warningServices = services.filter(s => 
        s.serviceStatus.length > 0 && s.serviceStatus[0].status === 'WARNING'
      ).length
      const errorServices = services.filter(s => 
        s.serviceStatus.length > 0 && ['ERROR', 'OFFLINE'].includes(s.serviceStatus[0].status)
      ).length

      // Get response times
      const recentChecks = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { gte: oneHourAgo },
          responseTime: { not: null }
        },
        select: {
          responseTime: true,
          checkedAt: true
        }
      })

      const avgResponseTime = recentChecks.length > 0 
        ? Math.round(recentChecks.reduce((acc, check) => acc + (check.responseTime || 0), 0) / recentChecks.length)
        : 0

      // Get daily uptime percentage
      const dailyChecks = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { gte: oneDayAgo }
        }
      })

      const totalChecks = dailyChecks.length
      const successfulChecks = dailyChecks.filter(check => check.status === 'ONLINE').length
      const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100

      return {
        totalServices,
        onlineServices,
        warningServices,
        errorServices,
        avgResponseTime,
        uptimePercentage: Math.round(uptimePercentage * 100) / 100,
        totalChecks: totalChecks,
        lastUpdated: now
      }
    }),

  // Get service history for a specific service
  getServiceHistory: protectedProcedure
    .input(z.object({
      serviceId: z.string(),
      timeRange: z.string().default('24h'),
      limit: z.number().min(1).max(1000).default(100)
    }))
    .query(async ({ ctx, input }) => {
      const { serviceId, timeRange, limit } = input

      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200
      }[timeRange] || 1440

      const startTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000)

      const service = await ctx.db.service.findUnique({
        where: { id: serviceId },
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime }
            },
            orderBy: { checkedAt: 'desc' },
            take: limit,
            select: {
              status: true,
              responseTime: true,
              statusCode: true,
              errorMessage: true,
              checkedAt: true
            }
          }
        }
      })

      if (!service) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Service not found'
        })
      }

      return {
        service: {
          id: service.id,
          name: service.name,
          url: service.url
        },
        history: service.serviceStatus.reverse() // Chronological order
      }
    }),

  // Check all services manually
  checkAllServices: adminProcedure
    .mutation(async ({ ctx }) => {
      const services = await ctx.db.service.findMany({
        where: { isActive: true }
      })

      const results = []
      
      for (const service of services) {
        try {
          // Perform health check
          const startTime = Date.now()
          const response = await fetch(service.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Service-Health-Monitor/1.0'
            },
            signal: AbortSignal.timeout(service.timeoutSeconds * 1000)
          })

          const responseTime = Date.now() - startTime
          const isHealthy = response.ok

          // Create status record
          const status = await ctx.db.serviceStatus.create({
            data: {
              serviceId: service.id,
              status: isHealthy ? 'ONLINE' : 'ERROR',
              responseTime,
              statusCode: response.status,
              errorMessage: isHealthy ? null : `HTTP ${response.status}: ${response.statusText}`,
              checkedAt: new Date()
            }
          })

          results.push({
            serviceId: service.id,
            serviceName: service.name,
            status: status.status,
            responseTime: status.responseTime,
            statusCode: status.statusCode
          })

        } catch (error) {
          // Create error status record
          const status = await ctx.db.serviceStatus.create({
            data: {
              serviceId: service.id,
              status: 'ERROR',
              responseTime: service.timeoutSeconds * 1000,
              statusCode: null,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              checkedAt: new Date()
            }
          })

          results.push({
            serviceId: service.id,
            serviceName: service.name,
            status: 'ERROR',
            responseTime: null,
            statusCode: null,
            error: status.errorMessage
          })
        }
      }

      return {
        timestamp: new Date(),
        totalServices: services.length,
        results
      }
    })
})