/**
 * NotificationFilters Component
 * Advanced filtering controls for notifications
 */

import React from 'react'
import { 
  FunnelIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { type NotificationFiltersProps } from '../types/notification.types'

export function NotificationFilters({ 
  filters, 
  onFiltersChange, 
  stats 
}: NotificationFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState(filters)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilter = (key: string) => {
    const newFilters = { ...localFilters }
    delete newFilters[key as keyof typeof newFilters]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(localFilters).length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </h4>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <div className="relative">
            <select
              value={localFilters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All types</option>
              <option value="service_down">Service Down ({stats.byType.service_down || 0})</option>
              <option value="service_up">Service Up ({stats.byType.service_up || 0})</option>
              <option value="slow_response">Slow Response ({stats.byType.slow_response || 0})</option>
              <option value="maintenance">Maintenance ({stats.byType.maintenance || 0})</option>
              <option value="security">Security ({stats.byType.security || 0})</option>
              <option value="user_action">User Action ({stats.byType.user_action || 0})</option>
              <option value="system">System ({stats.byType.system || 0})</option>
            </select>
            
            {localFilters.type && (
              <button
                onClick={() => clearFilter('type')}
                className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <div className="relative">
            <select
              value={localFilters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All priorities</option>
              <option value="critical">Critical ({stats.byPriority.critical || 0})</option>
              <option value="high">High ({stats.byPriority.high || 0})</option>
              <option value="medium">Medium ({stats.byPriority.medium || 0})</option>
              <option value="low">Low ({stats.byPriority.low || 0})</option>
            </select>
            
            {localFilters.priority && (
              <button
                onClick={() => clearFilter('priority')}
                className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Read Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={localFilters.isRead === undefined ? '' : localFilters.isRead.toString()}
              onChange={(e) => {
                const value = e.target.value
                handleFilterChange('isRead', value === '' ? undefined : value === 'true')
              }}
              className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All notifications</option>
              <option value="false">Unread ({stats.unread})</option>
              <option value="true">Read ({stats.total - stats.unread})</option>
            </select>
            
            {localFilters.isRead !== undefined && (
              <button
                onClick={() => clearFilter('isRead')}
                className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search notifications..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          
          {localFilters.search && (
            <button
              onClick={() => clearFilter('search')}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={localFilters.startDate ? localFilters.startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={localFilters.endDate ? localFilters.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="block w-full px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value) return null
            
            let displayValue = value.toString()
            if (key === 'isRead') {
              displayValue = value ? 'Read' : 'Unread'
            } else if (key === 'startDate' || key === 'endDate') {
              displayValue = new Date(value).toLocaleDateString()
            } else if (typeof value === 'string') {
              displayValue = value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
            
            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
              >
                {key}: {displayValue}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}