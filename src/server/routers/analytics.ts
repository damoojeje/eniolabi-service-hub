/**
 * Analytics tRPC Router
 * Service analytics, metrics, and reporting functionality
 */

import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

// Validation Schemas
const timeRangeSchema = z.enum(['1h', '6h', '24h', '7d', '30d', '90d'])

const analyticsFiltersSchema = z.object({
  serviceIds: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  statuses: z.array(z.enum(['ONLINE', 'WARNING', 'ERROR', 'OFFLINE'])).optional(),
  timeRange: timeRangeSchema,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  groupBy: z.enum(['service', 'category', 'status', 'hour', 'day', 'week']).optional(),
  metrics: z.array(z.enum(['uptime', 'response_time', 'status_distribution', 'availability', 'error_rate'])).optional()
})

const serviceIncidentSchema = z.object({
  serviceId: z.string(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000),
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']).default('INVESTIGATING'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  startTime: z.date(),
  endTime: z.date().optional(),
  affectedServices: z.array(z.string()).default([]),
  impactedUsers: z.number().optional(),
  rootCause: z.string().optional(),
  resolution: z.string().optional()
})

export const analyticsRouter = createTRPCRouter({
  // Get system overview metrics
  getSystemOverview: protectedProcedure
    .input(z.object({
      timeRange: timeRangeSchema.default('24h')
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange } = input
      
      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200,
        '90d': 129600
      }[timeRange]
      
      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Get services count by status
      const [
        totalServices,
        onlineServices,
        warningServices,
        errorServices,
        offlineServices,
        recentChecks,
        activeIncidents
      ] = await Promise.all([
        ctx.db.service.count({ where: { isActive: true } }),
        
        // Count services by their latest status
        ctx.db.service.count({
          where: {
            isActive: true,
            serviceStatus: {
              some: {
                status: 'ONLINE',
                checkedAt: { gte: startTime }
              }
            }
          }
        }),
        
        ctx.db.service.count({
          where: {
            isActive: true,
            serviceStatus: {
              some: {
                status: 'WARNING',
                checkedAt: { gte: startTime }
              }
            }
          }
        }),
        
        ctx.db.service.count({
          where: {
            isActive: true,
            serviceStatus: {
              some: {
                status: 'ERROR',
                checkedAt: { gte: startTime }
              }
            }
          }
        }),
        
        ctx.db.service.count({
          where: {
            isActive: true,
            serviceStatus: {
              some: {
                status: 'OFFLINE',
                checkedAt: { gte: startTime }
              }
            }
          }
        }),

        // Get recent status checks for calculations
        ctx.db.serviceStatus.findMany({
          where: {
            checkedAt: { gte: startTime },
            service: { isActive: true }
          },
          select: {
            status: true,
            responseTime: true,
            checkedAt: true,
            serviceId: true
          }
        }),

        // Count active incidents (placeholder - would need incident tracking)
        Promise.resolve(0)
      ])

      // Calculate metrics from recent checks
      const totalChecks = recentChecks.length
      const onlineChecks = recentChecks.filter(c => c.status === 'ONLINE').length
      const avgUptime = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 0
      
      const validResponseTimes = recentChecks
        .filter(c => c.responseTime !== null)
        .map(c => c.responseTime as number)
      const avgResponseTime = validResponseTimes.length > 0 
        ? validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length 
        : 0

      // Calculate health score (weighted average of uptime and response time)
      const uptimeScore = avgUptime
      const responseScore = avgResponseTime < 1000 ? 100 : Math.max(0, 100 - (avgResponseTime - 1000) / 100)
      const healthScore = Math.round((uptimeScore * 0.7) + (responseScore * 0.3))

      return {
        totalServices,
        onlineServices,
        warningServices,
        errorServices,
        offlineServices,
        totalChecks,
        avgUptime: Math.round(avgUptime * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        activeIncidents,
        resolvedIncidents: 0, // Placeholder
        slaCompliance: avgUptime, // Simplified SLA compliance
        healthScore
      }
    }),

  // Get service metrics for specific services
  getServiceMetrics: protectedProcedure
    .input(z.object({
      serviceIds: z.array(z.string()).optional(),
      timeRange: timeRangeSchema.default('24h')
    }))
    .query(async ({ ctx, input }) => {
      const { serviceIds, timeRange } = input

      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200,
        '90d': 129600
      }[timeRange]
      
      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Build service filter
      const serviceFilter: any = { isActive: true }
      if (serviceIds && serviceIds.length > 0) {
        serviceFilter.id = { in: serviceIds }
      }

      // Get services with their status history
      const services = await ctx.db.service.findMany({
        where: serviceFilter,
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime }
            },
            orderBy: { checkedAt: 'desc' }
          }
        }
      })

      // Calculate metrics for each service
      const serviceMetrics = services.map(service => {
        const checks = service.serviceStatus
        const totalChecks = checks.length
        const successfulChecks = checks.filter(c => c.status === 'ONLINE').length
        const failedChecks = totalChecks - successfulChecks
        
        const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0
        const errorRate = totalChecks > 0 ? (failedChecks / totalChecks) * 100 : 0
        
        const validResponseTimes = checks
          .filter(c => c.responseTime !== null)
          .map(c => c.responseTime as number)
          .sort((a, b) => a - b)
        
        const avgResponseTime = validResponseTimes.length > 0 
          ? validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length 
          : 0
        
        const medianResponseTime = validResponseTimes.length > 0
          ? validResponseTimes[Math.floor(validResponseTimes.length / 2)]
          : 0
        
        const p95ResponseTime = validResponseTimes.length > 0
          ? validResponseTimes[Math.floor(validResponseTimes.length * 0.95)]
          : 0
        
        const p99ResponseTime = validResponseTimes.length > 0
          ? validResponseTimes[Math.floor(validResponseTimes.length * 0.99)]
          : 0

        const currentStatus = checks.length > 0 ? checks[0].status : 'OFFLINE'
        const lastChecked = checks.length > 0 ? checks[0].checkedAt : new Date()

        return {
          serviceId: service.id,
          serviceName: service.name,
          timeRange,
          uptime: Math.round(uptime * 100) / 100,
          avgResponseTime: Math.round(avgResponseTime),
          medianResponseTime: Math.round(medianResponseTime),
          p95ResponseTime: Math.round(p95ResponseTime),
          p99ResponseTime: Math.round(p99ResponseTime),
          totalChecks,
          successfulChecks,
          failedChecks,
          errorRate: Math.round(errorRate * 100) / 100,
          availability: uptime, // Same as uptime for now
          lastChecked,
          currentStatus
        }
      })

      return serviceMetrics
    }),

  // Get time series data for charts
  getTimeSeriesData: protectedProcedure
    .input(z.object({
      serviceIds: z.array(z.string()).optional(),
      timeRange: timeRangeSchema.default('24h'),
      metrics: z.array(z.enum(['uptime', 'response_time', 'status_distribution'])).default(['uptime', 'response_time'])
    }))
    .query(async ({ ctx, input }) => {
      const { serviceIds, timeRange, metrics } = input

      // Calculate time boundaries and interval
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200,
        '90d': 129600
      }[timeRange]
      
      const intervalMinutes = {
        '1h': 5,
        '6h': 15,
        '24h': 60,
        '7d': 360,
        '30d': 1440,
        '90d': 4320
      }[timeRange]
      
      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Build service filter
      const serviceFilter: any = { isActive: true }
      if (serviceIds && serviceIds.length > 0) {
        serviceFilter.id = { in: serviceIds }
      }

      // Get status data within time range
      const statusData = await ctx.db.serviceStatus.findMany({
        where: {
          checkedAt: { 
            gte: startTime,
            lte: now
          },
          service: serviceFilter
        },
        include: {
          service: {
            select: { name: true }
          }
        },
        orderBy: { checkedAt: 'asc' }
      })

      // Group data by time intervals
      const intervals = Math.ceil(timeRangeMinutes / intervalMinutes)
      const timeSeriesData: Record<string, any[]> = {}

      // Initialize metrics arrays
      if (metrics.includes('uptime')) timeSeriesData.uptime = []
      if (metrics.includes('response_time')) timeSeriesData.response_time = []
      if (metrics.includes('status_distribution')) timeSeriesData.status_distribution = []

      // Generate time buckets
      for (let i = 0; i < intervals; i++) {
        const bucketStart = new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000)
        const bucketEnd = new Date(bucketStart.getTime() + intervalMinutes * 60 * 1000)
        
        const bucketData = statusData.filter(d => 
          d.checkedAt >= bucketStart && d.checkedAt < bucketEnd
        )

        if (metrics.includes('uptime')) {
          const onlineCount = bucketData.filter(d => d.status === 'ONLINE').length
          const totalCount = bucketData.length
          const uptimePercent = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0
          
          timeSeriesData.uptime.push({
            timestamp: bucketStart,
            value: Math.round(uptimePercent * 100) / 100
          })
        }

        if (metrics.includes('response_time')) {
          const validResponseTimes = bucketData
            .filter(d => d.responseTime !== null)
            .map(d => d.responseTime as number)
          
          const avgResponseTime = validResponseTimes.length > 0
            ? validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length
            : 0

          timeSeriesData.response_time.push({
            timestamp: bucketStart,
            value: Math.round(avgResponseTime),
            status: bucketData.length > 0 ? bucketData[bucketData.length - 1].status : 'OFFLINE'
          })
        }

        if (metrics.includes('status_distribution')) {
          const statusCounts = bucketData.reduce((acc, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          timeSeriesData.status_distribution.push({
            timestamp: bucketStart,
            value: bucketData.length,
            statusCounts
          })
        }
      }

      return timeSeriesData
    }),

  // Get alerts overview
  getAlertsOverview: protectedProcedure
    .input(z.object({
      timeRange: timeRangeSchema.default('24h'),
      serviceIds: z.array(z.string()).optional()
    }))
    .query(async ({ ctx, input }) => {
      const { timeRange, serviceIds } = input

      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200,
        '90d': 129600
      }[timeRange]
      
      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Build service filter
      let serviceFilter: any = { isActive: true }
      if (serviceIds && serviceIds.length > 0) {
        serviceFilter.id = { in: serviceIds }
      }

      // Get services with recent error/warning statuses as "alerts"
      const alertServices = await ctx.db.service.findMany({
        where: serviceFilter,
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime },
              status: { in: ['ERROR', 'OFFLINE', 'WARNING'] }
            },
            orderBy: { checkedAt: 'desc' },
            take: 10
          }
        }
      })

      // Transform service status to alert-like objects
      const recentAlerts = alertServices.flatMap(service => 
        service.serviceStatus.map(status => ({
          id: status.id,
          serviceId: service.id,
          serviceName: service.name,
          type: status.status === 'OFFLINE' ? 'DOWN' : 
                status.status === 'ERROR' ? 'ERROR' :
                status.status === 'WARNING' ? 'SLOW' : 'ERROR',
          severity: status.status === 'OFFLINE' ? 'CRITICAL' :
                   status.status === 'ERROR' ? 'HIGH' :
                   status.status === 'WARNING' ? 'MEDIUM' : 'LOW',
          message: status.errorMessage || `Service is ${status.status.toLowerCase()}`,
          triggeredAt: status.checkedAt,
          isActive: true,
          metadata: {
            responseTime: status.responseTime,
            statusCode: status.statusCode
          }
        }))
      ).slice(0, 20) // Limit to 20 most recent

      // Calculate counts
      const total = recentAlerts.length
      const active = recentAlerts.filter(a => a.isActive).length
      const resolved = total - active

      // Group by service and severity
      const byService = recentAlerts.reduce((acc, alert) => {
        acc[alert.serviceName] = (acc[alert.serviceName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const bySeverity = recentAlerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        total,
        active,
        resolved,
        byService,
        bySeverity,
        recentAlerts,
        trendsData: [] // Placeholder for trends data
      }
    }),

  // Get service health metrics
  getServiceHealthMetrics: protectedProcedure
    .input(z.object({
      serviceIds: z.array(z.string()).optional(),
      timeRange: timeRangeSchema.default('24h')
    }))
    .query(async ({ ctx, input }) => {
      const { serviceIds, timeRange } = input

      // Calculate time boundaries
      const now = new Date()
      const timeRangeMinutes = {
        '1h': 60,
        '6h': 360,
        '24h': 1440,
        '7d': 10080,
        '30d': 43200,
        '90d': 129600
      }[timeRange]

      const startTime = new Date(now.getTime() - timeRangeMinutes * 60 * 1000)

      // Build service filter
      const serviceFilter: any = { isActive: true }
      if (serviceIds && serviceIds.length > 0) {
        serviceFilter.id = { in: serviceIds }
      }

      // Get services with their status history
      const services = await ctx.db.service.findMany({
        where: serviceFilter,
        include: {
          serviceStatus: {
            where: {
              checkedAt: { gte: startTime }
            },
            orderBy: { checkedAt: 'desc' }
          }
        }
      })

      // Calculate metrics for each service
      const metrics = services.map(service => {
        const checks = service.serviceStatus
        const totalChecks = checks.length
        const successfulChecks = checks.filter(c => c.status === 'ONLINE').length
        const failedChecks = totalChecks - successfulChecks

        const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0
        const errorRate = totalChecks > 0 ? (failedChecks / totalChecks) * 100 : 0

        const validResponseTimes = checks
          .filter(c => c.responseTime !== null)
          .map(c => c.responseTime as number)

        const avgResponseTime = validResponseTimes.length > 0
          ? validResponseTimes.reduce((sum, rt) => sum + rt, 0) / validResponseTimes.length
          : 0

        return {
          serviceId: service.id,
          serviceName: service.name,
          uptime,
          avgResponseTime,
          errorRate
        }
      })

      return metrics.map(metric => ({
        serviceId: metric.serviceId,
        serviceName: metric.serviceName,
        category: 'web', // Default category - could be enhanced with service category
        currentStatus: metric.currentStatus,
        uptime: metric.uptime,
        downtime: 100 - metric.uptime,
        avgResponseTime: metric.avgResponseTime,
        lastIncident: null, // Placeholder
        incidentCount: 0, // Placeholder
        slaCompliance: metric.uptime, // Simplified SLA
        healthScore: Math.round(
          (metric.uptime * 0.4) + 
          ((metric.avgResponseTime < 1000 ? 100 : Math.max(0, 100 - (metric.avgResponseTime - 1000) / 100)) * 0.3) +
          ((100 - metric.errorRate) * 0.3)
        )
      }))
    }),

  // Generate performance report (admin only)
  generateReport: adminProcedure
    .input(z.object({
      name: z.string().min(1, 'Report name is required'),
      description: z.string().optional().default(''),
      reportType: z.enum(['SERVICE', 'SYSTEM', 'SLA', 'CUSTOM']).default('SERVICE'),
      timeRange: timeRangeSchema,
      services: z.array(z.string()),
      metrics: z.array(z.enum(['uptime', 'response_time', 'status_distribution', 'availability', 'error_rate'])),
      format: z.enum(['JSON', 'PDF', 'CSV', 'XLSX']).default('JSON')
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, description, reportType, timeRange, services, metrics, format } = input

      // Build report data structure
      const reportData = {
        id: `report_${Date.now()}`,
        name,
        description,
        reportType,
        timeRange,
        services,
        metrics,
        generatedAt: new Date(),
        generatedBy: ctx.session.user.id,
        data: {
          summary: `Report generated for ${services.length || 'all'} services over ${timeRange}`,
          message: 'Report generation completed successfully'
        },
        format,
        downloadUrl: `/api/reports/download/${Date.now()}`, // Mock download URL
        isScheduled: false
      }

      return reportData
    })
})