/**
 * Shared error handling utilities
 * Eliminates duplication of common error patterns across the application
 */

import { TRPCError } from '@trpc/server'

/**
 * Standard error types
 */
export type ErrorType = 
  | 'NOT_FOUND'
  | 'UNAUTHORIZED' 
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

/**
 * Error factory functions
 */
export const errors = {
  /**
   * Generic not found error
   */
  notFound: (message: string = 'Resource not found') => 
    new TRPCError({
      code: 'NOT_FOUND',
      message,
    }),

  /**
   * User not found error
   */
  userNotFound: (id?: string) => 
    new TRPCError({
      code: 'NOT_FOUND',
      message: id ? `User with ID "${id}" not found` : 'User not found',
    }),
  
  /**
   * Service not found error
   */
  serviceNotFound: (id?: string) => 
    new TRPCError({
      code: 'NOT_FOUND',
      message: id ? `Service with ID "${id}" not found` : 'Service not found',
    }),
  
  /**
   * Notification not found error
   */
  notificationNotFound: (id?: string) => 
    new TRPCError({
      code: 'NOT_FOUND',
      message: id ? `Notification with ID "${id}" not found` : 'Notification not found',
    }),
  
  /**
   * Insufficient permissions error
   */
  insufficientPermissions: (action: string) => 
    new TRPCError({
      code: 'FORBIDDEN',
      message: `Insufficient permissions to ${action}`,
    }),
  
  /**
   * Cannot modify own account error
   */
  cannotModifyOwnAccount: (action: string) => 
    new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cannot ${action} your own account`,
    }),
  
  /**
   * User already exists error
   */
  userAlreadyExists: (field: string, value: string) => 
    new TRPCError({
      code: 'CONFLICT',
      message: `User with ${field} "${value}" already exists`,
    }),
  
  /**
   * Invalid credentials error
   */
  invalidCredentials: () => 
    new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    }),
  
  /**
   * Authentication required error
   */
  authenticationRequired: () => 
    new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    }),
  
  /**
   * Validation error
   */
  validationError: (message: string) => 
    new TRPCError({
      code: 'BAD_REQUEST',
      message: `Validation error: ${message}`,
    }),
  
  /**
   * Service operation error
   */
  serviceOperationError: (operation: string, serviceName: string, error?: string) => 
    new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to ${operation} service "${serviceName}"${error ? `: ${error}` : ''}`,
    }),
  
  /**
   * Database operation error
   */
  databaseError: (operation: string) => 
    new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Database ${operation} failed`,
    }),
}

/**
 * Error handling helper functions
 */
export const errorHelpers = {
  /**
   * Check if user can modify target user
   */
  checkUserModificationPermissions: (
    currentUserId: string, 
    targetUserId: string, 
    currentUserRole: string,
    action: string
  ) => {
    // Users cannot modify their own accounts for certain actions
    if (currentUserId === targetUserId && ['delete', 'deactivate'].includes(action.toLowerCase())) {
      throw errors.cannotModifyOwnAccount(action)
    }
    
    // Only admins can modify other users
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      throw errors.insufficientPermissions(action + ' other users')
    }
  },
  
  /**
   * Check if user has required role
   */
  requireRole: (userRole: string, requiredRole: string | string[], action: string) => {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!requiredRoles.includes(userRole)) {
      throw errors.insufficientPermissions(action)
    }
  },
  
  /**
   * Check admin permissions
   */
  requireAdmin: (userRole: string, action: string) => {
    if (userRole !== 'ADMIN') {
      throw errors.insufficientPermissions(action)
    }
  },
  
  /**
   * Check service management permissions
   */
  requireServiceManagement: (userRole: string, action: string) => {
    if (!['ADMIN', 'POWER_USER'].includes(userRole)) {
      throw errors.insufficientPermissions(action + ' services')
    }
  },
  
  /**
   * Handle Prisma errors and convert to TRPC errors
   */
  handlePrismaError: (error: any, operation: string) => {
    console.error(`Prisma error during ${operation}:`, error)
    
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field'
      throw new TRPCError({
        code: 'CONFLICT',
        message: `${field} already exists`,
      })
    }
    
    if (error.code === 'P2025') {
      // Record not found
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Record not found',
      })
    }
    
    // Generic database error
    throw errors.databaseError(operation)
  },
  
  /**
   * Safely execute async operation with error handling
   */
  safeExecute: async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    try {
      return await operation()
    } catch (error: any) {
      if (error instanceof TRPCError) {
        throw error
      }
      
      // Handle Prisma errors
      if (error.code?.startsWith?.('P')) {
        errorHelpers.handlePrismaError(error, operationName)
      }
      
      // Generic error
      console.error(`Error during ${operationName}:`, error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `${operationName} failed`,
      })
    }
  },
}

/**
 * Common error messages
 */
export const errorMessages = {
  GENERIC: 'An unexpected error occurred',
  NETWORK: 'Network error occurred',
  TIMEOUT: 'Request timed out',
  INVALID_INPUT: 'Invalid input provided',
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  PERMISSION_DENIED: 'Permission denied',
  AUTHENTICATION_FAILED: 'Authentication failed',
  VALIDATION_FAILED: 'Validation failed',
  OPERATION_FAILED: 'Operation failed',
}