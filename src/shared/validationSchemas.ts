/**
 * Shared validation schemas
 * Eliminates duplication of common validation patterns across tRPC routers
 */

import { z } from 'zod'

/**
 * Common field validations
 */
export const commonSchemas = {
  // ID validation - expects object with id property to match server usage
  id: z.object({ id: z.string() }),
  
  // User role validation
  role: z.enum(['ADMIN', 'POWER_USER', 'GUEST']),
  
  // Password validation
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  // Username validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  
  // Service status validation
  serviceStatus: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR', 'WARNING', 'TIMEOUT']),
  
  // Notification priority validation
  notificationPriority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // Optional URL validation
  optionalUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  
  // Positive integer validation
  positiveInt: z.number().int().positive('Must be a positive integer'),
  
  // Non-negative integer validation
  nonNegativeInt: z.number().int().min(0, 'Must be a non-negative integer'),
}

/**
 * Common object schemas
 */
export const objectSchemas = {
  // ID only schema
  idOnly: z.object({
    id: commonSchemas.id,
  }),
  
  // User creation schema
  createUser: z.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    name: z.string().min(1).max(100).optional(),
    password: commonSchemas.password,
    role: commonSchemas.role.default('GUEST'),
  }),
  
  // User update schema
  updateUser: z.object({
    id: z.string(),
    username: commonSchemas.username.optional(),
    email: commonSchemas.email.optional(),
    name: z.string().min(1).max(100).optional(),
    role: commonSchemas.role.optional(),
    isActive: z.boolean().optional(),
  }),
  
  // Password reset schema
  resetPassword: z.object({
    id: commonSchemas.id,
    newPassword: commonSchemas.password,
  }),
  
  // Service management schema
  manageService: z.object({
    serviceId: commonSchemas.id,
  }),
  
  // Service creation schema
  createService: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    description: z.string().min(1),
    category: z.string().min(1),
    status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']).default('ONLINE'),
    healthCheckUrl: z.string().url().optional(),
    expectedResponseTime: z.number().positive().optional(),
    retryAttempts: z.number().min(0).max(10).optional(),
    timeout: z.number().positive().optional(),
  }),
  
  // Service update schema
  updateService: z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    url: z.string().url().optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']).optional(),
    healthCheckUrl: z.string().url().optional(),
    expectedResponseTime: z.number().positive().optional(),
    retryAttempts: z.number().min(0).max(10).optional(),
    timeout: z.number().positive().optional(),
  }),
  
  // Service status history schema
  getStatusHistory: z.object({
    serviceId: z.string(),
    timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
  }),
  
  // Notification preferences update schema
  updateNotificationPreferences: z.object({
    emailEnabled: z.boolean().optional(),
    statusChanges: z.boolean().optional(),
    onlineToOffline: z.boolean().optional(),
    offlineToOnline: z.boolean().optional(),
    errorAlerts: z.boolean().optional(),
    warningAlerts: z.boolean().optional(),
    systemAlerts: z.boolean().optional(),
  }),
  
  // Create notification schema
  createNotification: z.object({
    userId: z.string(),
    type: z.enum(['service_down', 'service_up', 'warning', 'info', 'incident', 'maintenance']),
    title: z.string(),
    message: z.string(),
    serviceId: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    category: z.enum(['system', 'service', 'user', 'security']).default('system'),
  }),
}

/**
 * Validation helper functions
 */
export const validationHelpers = {
  /**
   * Validate array of IDs
   */
  validateIds: (ids: string[]) => {
    return z.array(commonSchemas.id).parse(ids)
  },
  
  /**
   * Validate role hierarchy (for role-based permissions)
   */
  canAssignRole: (assignerRole: string, targetRole: string): boolean => {
    const roleHierarchy = { ADMIN: 3, POWER_USER: 2, GUEST: 1 }
    const assignerLevel = roleHierarchy[assignerRole as keyof typeof roleHierarchy] || 0
    const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0
    return assignerLevel >= targetLevel
  },
  
  /**
   * Sanitize string input
   */
  sanitizeString: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ')
  },
}