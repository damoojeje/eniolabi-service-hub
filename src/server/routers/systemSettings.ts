import { z } from 'zod'
import { createTRPCRouter, adminProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { clearDebugCache } from '@/lib/debug'

const updateSystemSettingsSchema = z.object({
  healthCheckInterval: z.number().min(30).max(3600).optional(), // 30 seconds to 1 hour
  notificationRetention: z.number().min(1).max(365).optional(),  // 1 day to 1 year
  maxRetryAttempts: z.number().min(1).max(10).optional(),
  timeoutThreshold: z.number().min(1000).max(30000).optional(),  // 1 to 30 seconds
  maintenanceMode: z.boolean().optional(),
  debugMode: z.boolean().optional(),
})

export const systemSettingsRouter = createTRPCRouter({
  // Get current system settings
  get: protectedProcedure.query(async ({ ctx }) => {
    // Try to get existing settings
    let settings = await ctx.db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await ctx.db.systemSettings.create({
        data: {
          healthCheckInterval: 300,
          notificationRetention: 30,
          maxRetryAttempts: 3,
          timeoutThreshold: 5000,
          maintenanceMode: false,
          debugMode: false,
          updatedBy: ctx.session.user.id,
        }
      })
    }

    return settings
  }),

  // Update system settings (admin only)
  update: adminProcedure
    .input(updateSystemSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Get current settings or create if none exist
      let currentSettings = await ctx.db.systemSettings.findFirst({
        orderBy: { updatedAt: 'desc' }
      })

      if (!currentSettings) {
        // Create new settings with provided values
        return await ctx.db.systemSettings.create({
          data: {
            healthCheckInterval: input.healthCheckInterval ?? 300,
            notificationRetention: input.notificationRetention ?? 30,
            maxRetryAttempts: input.maxRetryAttempts ?? 3,
            timeoutThreshold: input.timeoutThreshold ?? 5000,
            maintenanceMode: input.maintenanceMode ?? false,
            debugMode: input.debugMode ?? false,
            updatedBy: ctx.session.user.id,
          }
        })
      } else {
        // Update existing settings
        return await ctx.db.systemSettings.update({
          where: { id: currentSettings.id },
          data: {
            ...input,
            updatedBy: ctx.session.user.id,
          }
        })
      }
    }),

  // Toggle maintenance mode (admin only)
  toggleMaintenanceMode: adminProcedure.mutation(async ({ ctx }) => {
    let settings = await ctx.db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (!settings) {
      // Create with maintenance mode enabled
      return await ctx.db.systemSettings.create({
        data: {
          healthCheckInterval: 300,
          notificationRetention: 30,
          maxRetryAttempts: 3,
          timeoutThreshold: 5000,
          maintenanceMode: true,
          debugMode: false,
          updatedBy: ctx.session.user.id,
        }
      })
    } else {
      return await ctx.db.systemSettings.update({
        where: { id: settings.id },
        data: {
          maintenanceMode: !settings.maintenanceMode,
          updatedBy: ctx.session.user.id,
        }
      })
    }
  }),

  // Toggle debug mode (admin only)
  toggleDebugMode: adminProcedure.mutation(async ({ ctx }) => {
    let settings = await ctx.db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    let result
    if (!settings) {
      // Create with debug mode enabled
      result = await ctx.db.systemSettings.create({
        data: {
          healthCheckInterval: 300,
          notificationRetention: 30,
          maxRetryAttempts: 3,
          timeoutThreshold: 5000,
          maintenanceMode: false,
          debugMode: true,
          updatedBy: ctx.session.user.id,
        }
      })
    } else {
      result = await ctx.db.systemSettings.update({
        where: { id: settings.id },
        data: {
          debugMode: !settings.debugMode,
          updatedBy: ctx.session.user.id,
        }
      })
    }

    // Clear debug cache when settings change
    clearDebugCache()

    return result
  }),

  // Get system status overview
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    return {
      maintenanceMode: settings?.maintenanceMode ?? false,
      debugMode: settings?.debugMode ?? false,
      healthCheckInterval: settings?.healthCheckInterval ?? 300,
      lastUpdated: settings?.updatedAt,
      updatedBy: settings?.updatedBy,
    }
  }),
})