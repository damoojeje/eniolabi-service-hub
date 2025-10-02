import { createTRPCRouter } from '../trpc'
import { servicesRouter } from './services'
import { usersRouter } from './users'
import { notificationsRouter } from './notifications'
import { notesRouter } from './notes'
import { analyticsRouter } from './analytics'
import { healthRouter } from './health'
import { systemSettingsRouter } from './systemSettings'

export const appRouter = createTRPCRouter({
  services: servicesRouter,
  users: usersRouter,
  notifications: notificationsRouter,
  notes: notesRouter,
  analytics: analyticsRouter,
  health: healthRouter,
  systemSettings: systemSettingsRouter,
})

export type AppRouter = typeof appRouter