/**
 * Consolidated Status Configuration
 * Central source of truth for all status-related constants, colors, and utilities
 */

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

// Service Status Types
export type ServiceStatus = 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN'

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// Priority Levels
export type Priority = 'low' | 'normal' | 'high' | 'urgent'

// Status Configuration
export const STATUS_CONFIG = {
  ONLINE: {
    label: 'Online',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    darkColor: 'dark:text-green-400',
    darkBgColor: 'dark:bg-green-900/20',
    darkBorderColor: 'dark:border-green-800',
    icon: CheckCircleIcon,
    badgeClasses: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cardClasses: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
  },
  WARNING: {
    label: 'Warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    darkColor: 'dark:text-yellow-400',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkBorderColor: 'dark:border-yellow-800',
    icon: ExclamationTriangleIcon,
    badgeClasses: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    cardClasses: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
  },
  ERROR: {
    label: 'Error',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    darkColor: 'dark:text-red-400',
    darkBgColor: 'dark:bg-red-900/20',
    darkBorderColor: 'dark:border-red-800',
    icon: XCircleIcon,
    badgeClasses: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cardClasses: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
  },
  OFFLINE: {
    label: 'Offline',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    darkColor: 'dark:text-gray-400',
    darkBgColor: 'dark:bg-gray-900/20',
    darkBorderColor: 'dark:border-gray-700',
    icon: XCircleIcon,
    badgeClasses: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    cardClasses: 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-700'
  },
  MAINTENANCE: {
    label: 'Maintenance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    darkColor: 'dark:text-blue-400',
    darkBgColor: 'dark:bg-blue-900/20',
    darkBorderColor: 'dark:border-blue-800',
    icon: ClockIcon,
    badgeClasses: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cardClasses: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
  },
  UNKNOWN: {
    label: 'Unknown',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    darkColor: 'dark:text-gray-500',
    darkBgColor: 'dark:bg-gray-800',
    darkBorderColor: 'dark:border-gray-600',
    icon: QuestionMarkCircleIcon,
    badgeClasses: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    cardClasses: 'border-gray-300 bg-gray-100 dark:bg-gray-800 dark:border-gray-600'
  }
} as const

// Notification Type Configuration
export const NOTIFICATION_CONFIG = {
  info: {
    label: 'Info',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: CheckCircleIcon,
    badgeClasses: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  success: {
    label: 'Success',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircleIcon,
    badgeClasses: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: ExclamationTriangleIcon,
    badgeClasses: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  error: {
    label: 'Error',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircleIcon,
    badgeClasses: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
} as const

// Priority Configuration
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    badgeClasses: 'bg-gray-100 text-gray-800'
  },
  normal: {
    label: 'Normal',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeClasses: 'bg-blue-100 text-blue-800'
  },
  high: {
    label: 'High',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    badgeClasses: 'bg-yellow-100 text-yellow-800'
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    badgeClasses: 'bg-red-100 text-red-800'
  }
} as const

// Utility Functions
export const getStatusConfig = (status: ServiceStatus) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN
}

export const getNotificationConfig = (type: NotificationType) => {
  return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.info
}

export const getPriorityConfig = (priority: Priority) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal
}

export const getStatusIcon = (status: ServiceStatus) => {
  return getStatusConfig(status).icon
}

export const getStatusColor = (status: ServiceStatus) => {
  const config = getStatusConfig(status)
  return `${config.color} ${config.bgColor} ${config.borderColor}`
}

export const getStatusBadgeClasses = (status: ServiceStatus) => {
  return getStatusConfig(status).badgeClasses
}

export const getStatusCardClasses = (status: ServiceStatus) => {
  return getStatusConfig(status).cardClasses
}

export const getNotificationIcon = (type: NotificationType) => {
  return getNotificationConfig(type).icon
}

export const getNotificationColor = (type: NotificationType) => {
  const config = getNotificationConfig(type)
  return `${config.color} ${config.bgColor} ${config.borderColor}`
}

export const getNotificationBadgeClasses = (type: NotificationType) => {
  return getNotificationConfig(type).badgeClasses
}

export const getPriorityColor = (priority: Priority) => {
  const config = getPriorityConfig(priority)
  return `${config.color} ${config.bgColor}`
}

export const getPriorityBadgeClasses = (priority: Priority) => {
  return getPriorityConfig(priority).badgeClasses
}

// Legacy compatibility functions (to be used during migration)
export const getTypeColor = getNotificationColor
export const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return new Date(date).toLocaleDateString()
}

// Chart Colors (for analytics)
export const CHART_COLORS = {
  primary: '#3b82f6',    // blue-500
  success: '#10b981',    // emerald-500
  warning: '#f59e0b',    // amber-500
  error: '#ef4444',      // red-500
  gray: '#6b7280'        // gray-500
} as const