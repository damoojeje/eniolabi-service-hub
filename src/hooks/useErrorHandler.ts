/**
 * useErrorHandler Hook
 * Provides standardized error handling for React components
 */

'use client'

import { useState, useCallback } from 'react'
import { TRPCError } from '@trpc/server'
import { useNotifications } from '@/contexts/NotificationContext'
import { trpc } from '@/lib/trpc'
import {
  AppError,
  AppErrorType,
  AppErrorFactory,
  ErrorLogger,
  ERROR_CONFIG,
  type UseErrorHandlerOptions,
  type ErrorHandler
} from '@/lib/errorHandling'

export function useErrorHandler(options: UseErrorHandlerOptions = {}): ErrorHandler {
  const {
    showToast = true,
    createNotification = true,
    logError = true,
    onError
  } = options

  const [error, setError] = useState<AppError | null>(null)
  const { addToast } = useNotifications()
  
  // tRPC mutation for creating error notifications
  const createErrorNotification = trpc.notifications.createErrorNotification.useMutation({
    onError: (error) => {
      // Fallback if notification creation fails
      console.error('Failed to create error notification:', error)
    }
  })

  const handleError = useCallback((
    errorInput: Error | TRPCError | AppError,
    type?: AppErrorType,
    context?: Record<string, any>
  ) => {
    let appError: AppError

    // Convert different error types to AppError
    if (errorInput instanceof TRPCError) {
      appError = AppErrorFactory.fromTRPCError(errorInput, context)
    } else if ('type' in errorInput && 'severity' in errorInput) {
      // Already an AppError
      appError = errorInput as AppError
    } else if (errorInput instanceof Error) {
      appError = AppErrorFactory.fromError(errorInput, type || 'UNKNOWN', context)
    } else {
      appError = AppErrorFactory.create(type || 'UNKNOWN', 'Unknown error occurred', { context })
    }

    // Set error state
    setError(appError)

    // Log error if enabled
    if (logError) {
      ErrorLogger.log(appError)
    }

    // Get error configuration
    const config = ERROR_CONFIG[appError.type]

    // Show toast notification if enabled
    if (showToast) {
      addToast({
        type: config.notificationType,
        title: getErrorTitle(appError.type),
        message: config.userMessage,
        duration: getToastDuration(config.severity)
      })
    }

    // Create persistent notification if enabled
    if (createNotification && config.severity !== 'low') {
      createErrorNotification.mutate({
        type: config.notificationType,
        title: `${getErrorTitle(appError.type)} - ${appError.type}`,
        message: `${config.userMessage}\n\nDetails: ${appError.message}`,
        priority: config.priority,
        context: {
          errorType: appError.type,
          severity: appError.severity,
          timestamp: appError.timestamp.toISOString(),
          ...(appError.context || {})
        }
      })
    }

    // Call custom error handler if provided
    if (onError) {
      onError(appError)
    }
  }, [showToast, createNotification, logError, onError, addToast, createErrorNotification])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    handleError,
    clearError,
    error
  }
}

// Helper functions
function getErrorTitle(type: AppErrorType): string {
  const titles: Record<AppErrorType, string> = {
    AUTHENTICATION: 'Authentication Error',
    AUTHORIZATION: 'Access Denied',
    VALIDATION: 'Validation Error',
    NOT_FOUND: 'Not Found',
    CONFLICT: 'Conflict',
    RATE_LIMIT: 'Rate Limited',
    EXTERNAL_SERVICE: 'Service Error',
    DATABASE: 'Database Error',
    NETWORK: 'Network Error',
    UNKNOWN: 'Error'
  }
  
  return titles[type] || 'Error'
}

function getToastDuration(severity: string): number {
  switch (severity) {
    case 'critical': return 10000 // 10 seconds
    case 'high': return 7000     // 7 seconds
    case 'medium': return 5000   // 5 seconds
    case 'low': return 3000      // 3 seconds
    default: return 5000
  }
}

// Specialized hooks for common scenarios
export function useAsyncErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { handleError, clearError, error } = useErrorHandler(options)

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    type?: AppErrorType,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      clearError()
      return await asyncFn()
    } catch (error) {
      handleError(error as Error, type, context)
      return null
    }
  }, [handleError, clearError])

  return {
    executeAsync,
    handleError,
    clearError,
    error
  }
}

export function useTRPCErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { handleError, clearError, error } = useErrorHandler(options)

  const handleTRPCError = useCallback((error: TRPCError, context?: Record<string, any>) => {
    handleError(error, undefined, context)
  }, [handleError])

  return {
    handleTRPCError,
    handleError,
    clearError,
    error
  }
}