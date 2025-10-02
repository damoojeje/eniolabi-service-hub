import { TRPCError } from '@trpc/server'

export interface ErrorDetails {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any

  constructor(message: string, code = 'UNKNOWN_ERROR', statusCode = 500, details?: any) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'AppError'

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Application
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof TRPCError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code
  }
  
  if (error instanceof TRPCError) {
    return error.code
  }
  
  return ERROR_CODES.UNKNOWN_ERROR
}

export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('fetch')
  )
}

export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error)
  return [
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
    ERROR_CODES.SESSION_EXPIRED
  ].includes(code as any)
}

export function getUserFriendlyError(error: unknown): ErrorDetails {
  const message = getErrorMessage(error)
  const code = getErrorCode(error)
  
  // Map technical errors to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    [ERROR_CODES.UNAUTHORIZED]: 'You need to log in to access this feature.',
    [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to perform this action.',
    [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ERROR_CODES.RECORD_NOT_FOUND]: 'The requested item could not be found.',
    [ERROR_CODES.DUPLICATE_ENTRY]: 'This item already exists.',
    [ERROR_CODES.DATABASE_ERROR]: 'We\'re experiencing database issues. Please try again later.',
    [ERROR_CODES.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
    [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
    [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  }
  
  return {
    message: friendlyMessages[code] || message || 'An unexpected error occurred. Please try again.',
    code,
    statusCode: error instanceof AppError ? error.statusCode : 500
  }
}

export function logError(error: unknown, context?: string) {
  console.error(`[${context || 'APP_ERROR'}]`, {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  })
}

// Retry logic for failed operations
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry auth errors or validation errors
      if (isAuthError(error) || getErrorCode(error) === ERROR_CODES.VALIDATION_ERROR) {
        throw error
      }
      
      if (attempt === maxAttempts) {
        break
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError
}

// Form validation helper
export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new AppError(`${fieldName} is required`, ERROR_CODES.REQUIRED_FIELD)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new AppError('Please enter a valid email address', ERROR_CODES.VALIDATION_ERROR)
  }
}

export function validateUrl(url: string): void {
  try {
    new URL(url)
  } catch {
    throw new AppError('Please enter a valid URL', ERROR_CODES.VALIDATION_ERROR)
  }
}