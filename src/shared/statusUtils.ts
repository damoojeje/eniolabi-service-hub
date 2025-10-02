/**
 * Shared utility functions for service status handling
 * Eliminates duplication across components that need status colors, icons, and formatting
 */

import { 
  GlobeAltIcon,
  ServerIcon,
  CpuChipIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { ComponentType } from 'react'

export type ServiceCategory = 'web' | 'database' | 'api' | 'monitoring' | 'infrastructure'

/**
 * Get status color with alpha transparency for charts and visualizations
 */
export function getStatusColorWithAlpha(status: string, alpha = 1): string {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
      return `rgba(34, 197, 94, ${alpha})` // green-500
    case 'OFFLINE':
      return `rgba(239, 68, 68, ${alpha})` // red-500
    case 'MAINTENANCE':
      return `rgba(245, 158, 11, ${alpha})` // yellow-500
    default:
      return `rgba(107, 114, 128, ${alpha})` // gray-500
  }
}

/**
 * Get React icon component for service category
 */
export function getCategoryIcon(category: string): ComponentType<any> {
  switch (category?.toLowerCase()) {
    case 'web':
      return GlobeAltIcon
    case 'database':
      return ServerIcon
    case 'api':
      return CpuChipIcon
    case 'monitoring':
      return ChartBarIcon
    case 'infrastructure':
      return ServerIcon
    default:
      return ServerIcon
  }
}

/**
 * Get status color for charts and visualizations
 */
export function getStatusColorForChart(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
      return '#10b981' // green-500
    case 'OFFLINE':
      return '#ef4444' // red-500
    case 'MAINTENANCE':
      return '#f59e0b' // yellow-500
    default:
      return '#6b7280' // gray-500
  }
}
