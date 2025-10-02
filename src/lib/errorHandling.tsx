/**
 * Standardized Error Handling System
 * Provides consistent error handling patterns across the application
 */

/** @jsx React.createElement */
import React from 'react'
import { TRPCError } from '@trpc/server'
import type { NotificationType, Priority } from '@/shared/statusConfig'

// Error Types
export type AppErrorType = 
  | 'AUTHENTICATION'
  | 'AUTHORIZATION' 
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'EXTERNAL_SERVICE'
  | 'DATABASE'
  | 'NETWORK'
  | 'UNKNOWN'

// Error Severity Levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

// Structured Error Interface
export interface AppError {
  type: AppErrorType
  message: string
  code?: string
  severity: ErrorSeverity
  context?: Record<string, any>
  cause?: Error
  timestamp: Date
  userId?: string
  requestId?: string
}

// Error Configuration
export const ERROR_CONFIG = {
  AUTHENTICATION: {
    severity: 'high' as ErrorSeverity,
    notificationType: 'error' as NotificationType,
    priority: 'high' as Priority,
    userMessage: 'Authentication failed. Please sign in again.',
    logLevel: 'warn'
  },
  AUTHORIZATION: {
    severity: 'medium' as ErrorSeverity,
    notificationType: 'warning' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'You do not have permission to perform this action.',
    logLevel: 'warn'
  },
  VALIDATION: {
    severity: 'low' as ErrorSeverity,
    notificationType: 'warning' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'Please check your input and try again.',
    logLevel: 'info'
  },
  NOT_FOUND: {
    severity: 'low' as ErrorSeverity,
    notificationType: 'info' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'The requested resource was not found.',
    logLevel: 'info'
  },
  CONFLICT: {
    severity: 'medium' as ErrorSeverity,
    notificationType: 'warning' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'This action conflicts with existing data.',
    logLevel: 'warn'
  },
  RATE_LIMIT: {
    severity: 'medium' as ErrorSeverity,
    notificationType: 'warning' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'Too many requests. Please wait and try again.',
    logLevel: 'warn'
  },
  EXTERNAL_SERVICE: {
    severity: 'high' as ErrorSeverity,
    notificationType: 'error' as NotificationType,
    priority: 'high' as Priority,
    userMessage: 'External service is unavailable. Please try again later.',
    logLevel: 'error'
  },
  DATABASE: {
    severity: 'critical' as ErrorSeverity,
    notificationType: 'error' as NotificationType,
    priority: 'urgent' as Priority,
    userMessage: 'Database error occurred. Please try again.',
    logLevel: 'error'
  },
  NETWORK: {
    severity: 'medium' as ErrorSeverity,
    notificationType: 'error' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'Network error. Please check your connection.',
    logLevel: 'warn'
  },
  UNKNOWN: {
    severity: 'medium' as ErrorSeverity,
    notificationType: 'error' as NotificationType,
    priority: 'normal' as Priority,
    userMessage: 'An unexpected error occurred. Please try again.',
    logLevel: 'error'
  }
} as const

// Error Factory
export class AppErrorFactory {
  static create(
    type: AppErrorType,
    message: string,
    options: {
      code?: string
      context?: Record<string, any>
      cause?: Error
      userId?: string
      requestId?: string
    } = {}
  ): AppError {
    const config = ERROR_CONFIG[type]
    
    return {
      type,
      message,
      code: options.code,
      severity: config.severity,
      context: options.context,
      cause: options.cause,
      timestamp: new Date(),
      userId: options.userId,
      requestId: options.requestId
    }
  }

  static fromTRPCError(error: TRPCError, context?: Record<string, any>): AppError {
    const typeMap: Record<string, AppErrorType> = {
      'UNAUTHORIZED': 'AUTHENTICATION',
      'FORBIDDEN': 'AUTHORIZATION',
      'NOT_FOUND': 'NOT_FOUND',
      'BAD_REQUEST': 'VALIDATION',
      'CONFLICT': 'CONFLICT',
      'TOO_MANY_REQUESTS': 'RATE_LIMIT',
      'INTERNAL_SERVER_ERROR': 'UNKNOWN',
      'TIMEOUT': 'NETWORK'
    }

    const type = typeMap[error.code] || 'UNKNOWN'
    
    return this.create(type, error.message, {
      code: error.code,
      context,
      cause: error.cause
    })
  }

  static fromError(error: Error, type: AppErrorType = 'UNKNOWN', context?: Record<string, any>): AppError {
    return this.create(type, error.message, {
      context,
      cause: error
    })
  }
}

// Error Logger
export class ErrorLogger {
  private static formatError(error: AppError): string {
    return JSON.stringify({
      type: error.type,
      message: error.message,
      code: error.code,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      userId: error.userId,
      requestId: error.requestId,
      context: error.context,
      stack: error.cause?.stack
    }, null, 2)
  }

  static log(error: AppError): void {
    const config = ERROR_CONFIG[error.type]
    const formattedError = this.formatError(error)

    switch (config.logLevel) {
      case 'info':
        console.info('🔵 App Error:', formattedError)
        break
      case 'warn':
        console.warn('🟡 App Error:', formattedError)
        break
      case 'error':
        console.error('🔴 App Error:', formattedError)
        break
      default:
        console.log('⚪ App Error:', formattedError)
    }

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production' && config.severity === 'critical') {
      // Send to external logging service (e.g., Sentry, LogRocket)
      // this.sendToExternalLogger(error)
    }
  }

  // Placeholder for external logging integration
  private static sendToExternalLogger(error: AppError): void {
    // Implementation would depend on your logging service
    console.log('Would send to external logger:', error)
  }
}

// Error Handler Hook (for React components)
export interface UseErrorHandlerOptions {
  showToast?: boolean
  createNotification?: boolean
  logError?: boolean
  onError?: (error: AppError) => void
}

export interface ErrorHandler {
  handleError: (error: Error | TRPCError | AppError, type?: AppErrorType, context?: Record<string, any>) => void
  clearError: () => void
  error: AppError | null
}

// Client-side error boundary utility
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

export const createErrorBoundary = (onError?: (error: AppError) => void) => {
  return class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
      const appError = AppErrorFactory.fromError(error, 'UNKNOWN')
      return { hasError: true, error: appError }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const appError = AppErrorFactory.fromError(error, 'UNKNOWN', {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      })
      
      ErrorLogger.log(appError)
      
      if (onError) {
        onError(appError)
      }
    }

    render() {
      if (this.state.hasError && this.state.error) {
        const config = ERROR_CONFIG[this.state.error.type]
        
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                {config.userMessage}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      }

      return this.props.children
    }
  }
}

// Utility functions for common error scenarios
export const handleAsyncError = async <T,>(
  asyncFn: () => Promise<T>,
  type: AppErrorType = 'UNKNOWN',
  context?: Record<string, any>
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await asyncFn()
    return { data }
  } catch (error) {
    const appError = error instanceof Error 
      ? AppErrorFactory.fromError(error, type, context)
      : AppErrorFactory.create(type, 'Unknown error occurred', { context })
    
    ErrorLogger.log(appError)
    return { error: appError }
  }
}

export const createTRPCErrorHandler = (
  type: AppErrorType = 'UNKNOWN',
  context?: Record<string, any>
) => {
  return (error: TRPCError) => {
    const appError = AppErrorFactory.fromTRPCError(error, context)
    ErrorLogger.log(appError)
    return appError
  }
}

// Export React import for error boundary
import React from 'react'
export { React }