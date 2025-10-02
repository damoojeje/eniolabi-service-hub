import { trpc } from '@/lib/trpc'

export interface ErrorTrackingOptions {
  title: string
  message: string
  context?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  showToast?: boolean
  toastDuration?: number
}

/**
 * Global error tracking utility
 * Creates persistent notifications and optionally shows toast messages
 */
export class ErrorTracker {
  private static instance: ErrorTracker
  private trpcUtils: ReturnType<typeof trpc.useUtils> | null = null

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  setTrpcUtils(utils: ReturnType<typeof trpc.useUtils>) {
    this.trpcUtils = utils
  }

  /**
   * Track an error by creating a persistent notification
   */
  async trackError(options: ErrorTrackingOptions): Promise<void> {
    try {
      // Create persistent notification
      if (this.trpcUtils) {
        await this.trpcUtils.client.notifications.createErrorNotification.mutate({
          title: options.title,
          message: options.message,
          context: options.context,
          priority: options.priority || 'high'
        })

        // Invalidate notifications to refresh the bell
        this.trpcUtils.notifications.getAll.invalidate()
      }
    } catch (error) {
      console.error('Failed to track error:', error)
      // Fallback: at least log to console if notification creation fails
      console.error(`[ERROR TRACKER] ${options.title}: ${options.message}`)
    }
  }

  /**
   * Common error scenarios
   */
  async trackServerCommunicationError(context: string, details?: string) {
    return this.trackError({
      title: 'Server Communication Error',
      message: `Failed to communicate with the server${details ? `: ${details}` : '. Please check your connection and try again.'}`,
      context,
      priority: 'high'
    })
  }

  async trackAuthenticationError(context: string) {
    return this.trackError({
      title: 'Authentication Required',
      message: 'You must be logged in to perform this action. Please log in and try again.',
      context,
      priority: 'high'
    })
  }

  async trackPermissionError(context: string, action: string) {
    return this.trackError({
      title: 'Permission Denied',
      message: `You don't have permission to ${action}.`,
      context,
      priority: 'medium'
    })
  }

  async trackValidationError(context: string, details: string) {
    return this.trackError({
      title: 'Validation Error',
      message: `Invalid data: ${details}`,
      context,
      priority: 'medium'
    })
  }

  async trackGenericError(context: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return this.trackError({
      title: 'System Error',
      message: errorMessage,
      context,
      priority: 'high'
    })
  }
}

/**
 * Hook to get error tracker instance with tRPC utilities
 */
export function useErrorTracker() {
  const utils = trpc.useUtils()
  const tracker = ErrorTracker.getInstance()
  tracker.setTrpcUtils(utils)
  return tracker
}