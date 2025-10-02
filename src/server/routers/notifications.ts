import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { createDefaultNotificationPreferences } from '@/lib/notifications'
import {
  errors,
  errorHelpers,
  commonSchemas,
  objectSchemas
} from '@/shared'
import { TRPCError } from '@trpc/server'

export const notificationsRouter = createTRPCRouter({
  // Get current user's notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    let preferences = await ctx.db.notificationPreference.findUnique({
      where: { userId: ctx.session.user.id }
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await createDefaultNotificationPreferences(
        ctx.session.user.id,
        ctx.session.user.role
      )
    }

    // Transform to match our enhanced notification preferences interface
    return {
      id: preferences.id,
      userId: preferences.userId,
      emailEnabled: preferences.emailEnabled,
      smsEnabled: false, // Not in current schema
      webhookEnabled: false, // Not in current schema
      slackEnabled: false, // Not in current schema
      preferences: {
        service_down: preferences.offlineToOnline ? ['in_app', 'email'] : ['in_app'],
        service_up: preferences.onlineToOffline ? ['in_app'] : [],
        slow_response: preferences.warningAlerts ? ['in_app'] : [],
        maintenance: ['in_app'],
        security: preferences.systemAlerts ? ['in_app', 'email'] : ['in_app'],
        user_action: ['in_app'],
        system: preferences.systemAlerts ? ['in_app', 'email'] : ['in_app']
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      },
      digestSettings: {
        enabled: false,
        frequency: 'daily' as const,
        time: '09:00'
      },
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt
    }
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(objectSchemas.updateNotificationPreferences)
    .mutation(async ({ ctx, input }) => {
      // Ensure preferences exist first
      let preferences = await ctx.db.notificationPreference.findUnique({
        where: { userId: ctx.session.user.id }
      })

      if (!preferences) {
        preferences = await createDefaultNotificationPreferences(
          ctx.session.user.id,
          ctx.session.user.role
        )
      }

      // Update preferences
      return await ctx.db.notificationPreference.update({
        where: { userId: ctx.session.user.id },
        data: input
      })
    }),

  // Test notification (send a test email)
  sendTestNotification: protectedProcedure.mutation(async ({ ctx }) => {
    const { sendSystemAlert } = await import('@/lib/email')
    
    const result = await sendSystemAlert(
      'Test Notification',
      `This is a test notification sent by ${ctx.session.user.username} at ${new Date().toLocaleString()}.\n\nIf you received this email, your notification settings are working correctly!`,
      'info',
      [ctx.session.user.email]
    )

    if (!result.success) {
      throw new Error(`Failed to send test notification: ${result.error}`)
    }

    return {
      success: true,
      message: 'Test notification sent successfully!'
    }
  }),

  // Get all notifications for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.notification.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to last 100 notifications
    })
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(commonSchemas.id)
    .mutation(async ({ ctx, input }) => {
      // Verify the notification belongs to the current user
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!notification) {
        throw errors.notificationNotFound()
      }

      return ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      })
    }),

  // Delete notification
  delete: protectedProcedure
    .input(commonSchemas.id)
    .mutation(async ({ ctx, input }) => {
      // Verify the notification belongs to the current user
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!notification) {
        throw errors.notificationNotFound()
      }

      return ctx.db.notification.delete({
        where: { id: input.id },
      })
    }),

  // Create notification (admin only)
  create: adminProcedure
    .input(objectSchemas.createNotification)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          serviceId: input.serviceId,
          priority: input.priority,
          category: input.category,
          isRead: false,
        },
      })
    }),

  // Create error notification for current user (system-generated errors)
  createErrorNotification: protectedProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      context: z.string().optional(), // e.g., 'notes-creation', 'service-check'
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('high'),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: 'error',
          title: input.title,
          message: input.message,
          priority: input.priority,
          metadata: input.context ? { context: input.context } : undefined,
          isRead: false,
        },
      })
    }),

  // Get notification statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      total,
      unread,
      critical,
      byType,
      byPriority,
      todayCount,
      weekCount
    ] = await Promise.all([
      ctx.db.notification.count({ where: { userId } }),
      ctx.db.notification.count({ where: { userId, isRead: false } }),
      ctx.db.notification.count({ where: { userId, priority: 'critical' } }),
      ctx.db.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true }
      }),
      ctx.db.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true }
      }),
      ctx.db.notification.count({
        where: {
          userId,
          createdAt: { gte: todayStart }
        }
      }),
      ctx.db.notification.count({
        where: {
          userId,
          createdAt: { gte: weekStart }
        }
      })
    ])

    // Convert group by results to proper format
    const typeStats: Record<string, number> = {}
    const priorityStats: Record<string, number> = {}

    byType.forEach(item => {
      typeStats[item.type] = item._count.type
    })

    byPriority.forEach(item => {
      priorityStats[item.priority] = item._count.priority
    })

    return {
      total,
      unread,
      critical,
      byType: typeStats,
      byPriority: priorityStats,
      todayCount,
      weekCount
    }
  }),

  // Get notifications with advanced filtering and pagination
  getNotifications: protectedProcedure
    .input(z.object({
      type: z.string().optional(), // Use string instead of enum to match existing schema
      priority: z.string().optional(), // Use string instead of enum to match existing schema
      isRead: z.boolean().optional(),
      serviceId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const { limit, offset, ...filters } = input
      const userId = ctx.session.user.id

      // Build where conditions
      const where: any = { userId }

      if (filters.type) where.type = filters.type
      if (filters.priority) where.priority = filters.priority
      if (typeof filters.isRead === 'boolean') where.isRead = filters.isRead
      // Skip serviceId filter as it's not in current schema
      if (filters.startDate || filters.endDate) {
        where.createdAt = {}
        if (filters.startDate) where.createdAt.gte = filters.startDate
        if (filters.endDate) where.createdAt.lte = filters.endDate
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      const [notifications, total] = await Promise.all([
        ctx.db.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        ctx.db.notification.count({ where })
      ])

      return {
        notifications: notifications.map(n => ({
          ...n,
          serviceName: undefined // No service relation in current schema
        })),
        total,
        hasMore: offset + notifications.length < total
      }
    }),

  // Get notification by ID
  getById: protectedProcedure
    .input(commonSchemas.id)
    .query(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.findUnique({
        where: { 
          id: input.id,
          userId: ctx.session.user.id 
        }
      })

      if (!notification) {
        throw errors.notificationNotFound()
      }

      return {
        ...notification,
        serviceName: undefined // No service relation in current schema
      }
    }),

  // Bulk actions on notifications
  bulkAction: protectedProcedure
    .input(z.object({
      action: z.enum(['mark_read', 'mark_unread', 'delete']),
      notificationIds: z.array(z.string()).min(1, 'At least one notification must be selected')
    }))
    .mutation(async ({ ctx, input }) => {
      const { action, notificationIds } = input

      // Verify ownership
      const notifications = await ctx.db.notification.findMany({
        where: {
          id: { in: notificationIds },
          userId: ctx.session.user.id
        },
        select: { id: true }
      })

      const foundIds = notifications.map(n => n.id)
      const notFoundIds = notificationIds.filter(id => !foundIds.includes(id))

      if (notFoundIds.length > 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Some notifications were not found: ${notFoundIds.join(', ')}`
        })
      }

      let updateData: any = {}
      
      switch (action) {
        case 'mark_read':
          updateData = { isRead: true }
          break
        case 'mark_unread':
          updateData = { isRead: false }
          break
        case 'delete':
          await ctx.db.notification.deleteMany({
            where: {
              id: { in: foundIds },
              userId: ctx.session.user.id
            }
          })
          return { success: true, affected: foundIds.length }
      }

      if (action !== 'delete') {
        const result = await ctx.db.notification.updateMany({
          where: {
            id: { in: foundIds },
            userId: ctx.session.user.id
          },
          data: updateData
        })

        return { success: true, affected: result.count }
      }
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await ctx.db.notification.updateMany({
        where: {
          userId: ctx.session.user.id,
          isRead: false
        },
        data: { isRead: true }
      })

      return { success: true, affected: result.count }
    }),

  // Delete all read notifications
  deleteAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await ctx.db.notification.deleteMany({
        where: {
          userId: ctx.session.user.id,
          isRead: true
        }
      })

      return { success: true, affected: result.count }
    }),

  // Admin: Get notification rules
  getRules: adminProcedure
    .query(async ({ ctx }) => {
      const rules = await ctx.db.notificationRule.findMany({
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return rules
    }),

  // Admin: Create notification rule (placeholder)
  createRule: adminProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required').max(255),
      description: z.string().max(500).optional().default(''),
      isActive: z.boolean().default(true),
      conditions: z.object({
        serviceIds: z.array(z.string()).optional(),
        types: z.array(z.enum(['service_down', 'service_up', 'slow_response', 'maintenance', 'security', 'user_action', 'system'])),
        priorities: z.array(z.enum(['low', 'medium', 'high', 'critical'])),
        keywords: z.array(z.string()).optional()
      }),
      actions: z.object({
        channels: z.array(z.enum(['in_app', 'email', 'sms', 'webhook', 'slack'])),
        template: z.string().optional(),
        webhookUrl: z.string().url().optional(),
        slackChannel: z.string().optional()
      }),
      cooldown: z.number().min(0).max(1440).default(5) // minutes
    }))
    .mutation(async ({ ctx, input }) => {
      const rule = await ctx.db.notificationRule.create({
        data: {
          name: input.name,
          description: input.description,
          isActive: input.isActive,
          conditions: input.conditions,
          actions: input.actions,
          cooldown: input.cooldown,
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

      return rule
    }),

  // Admin: Update notification rule (placeholder)
  updateRule: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Name is required').max(255),
      description: z.string().max(500).optional(),
      isActive: z.boolean(),
      conditions: z.object({
        serviceIds: z.array(z.string()).optional(),
        types: z.array(z.enum(['service_down', 'service_up', 'slow_response', 'maintenance', 'security', 'user_action', 'system'])),
        priorities: z.array(z.enum(['low', 'medium', 'high', 'critical'])),
        keywords: z.array(z.string()).optional()
      }),
      actions: z.object({
        channels: z.array(z.enum(['in_app', 'email', 'sms', 'webhook', 'slack'])),
        template: z.string().optional(),
        webhookUrl: z.string().url().optional(),
        slackChannel: z.string().optional()
      }),
      cooldown: z.number().min(0).max(1440)
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      
      const rule = await ctx.db.notificationRule.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              username: true,
              name: true
            }
          }
        }
      })

      return rule
    }),

  // Admin: Delete notification rule
  deleteRule: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notificationRule.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // Admin: Test notification rule (placeholder)
  testRule: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Create a test notification using existing schema
      const testNotification = await ctx.db.notification.create({
        data: {
          title: 'Test Notification',
          message: 'This is a test notification from the notification management system.',
          type: 'info',
          priority: 'normal',
          userId: ctx.session.user.id,
          isRead: false
        }
      })

      return { success: true, notification: testNotification }
    }),

  // Admin: Delete old notifications
  deleteOldNotifications: adminProcedure
    .mutation(async ({ ctx }) => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const result = await ctx.db.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      })

      return { success: true, deleted: result.count }
    })
})