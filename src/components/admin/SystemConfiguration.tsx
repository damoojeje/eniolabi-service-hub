'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  ShieldCheckIcon,
  BugAntIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface SystemSettings {
  healthCheckInterval: number
  notificationRetention: number
  maxRetryAttempts: number
  timeoutThreshold: number
  maintenanceMode: boolean
  debugMode: boolean
}

export default function SystemConfiguration() {
  const { addToast } = useNotifications()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<SystemSettings>({
    healthCheckInterval: 300,
    notificationRetention: 30,
    maxRetryAttempts: 3,
    timeoutThreshold: 5000,
    maintenanceMode: false,
    debugMode: false
  })

  const { data: settings, isLoading, refetch } = trpc.systemSettings.get.useQuery()
  const { data: status } = trpc.systemSettings.getStatus.useQuery()

  const updateMutation = trpc.systemSettings.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Settings Updated',
        message: 'System configuration has been updated successfully'
      })
      refetch()
      setIsEditing(false)
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const toggleMaintenanceMutation = trpc.systemSettings.toggleMaintenanceMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Maintenance Mode Toggled',
        message: 'System maintenance mode has been updated'
      })
      refetch()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const toggleDebugMutation = trpc.systemSettings.toggleDebugMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Debug Mode Toggled',
        message: 'System debug mode has been updated'
      })
      refetch()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  // Initialize form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        healthCheckInterval: settings.healthCheckInterval || 300,
        notificationRetention: settings.notificationRetention || 30,
        maxRetryAttempts: settings.maxRetryAttempts || 3,
        timeoutThreshold: settings.timeoutThreshold || 5000,
        maintenanceMode: settings.maintenanceMode || false,
        debugMode: settings.debugMode || false
      })
    }
  }, [settings])

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (settings) {
      setFormData({
        healthCheckInterval: settings.healthCheckInterval || 300,
        notificationRetention: settings.notificationRetention || 30,
        maxRetryAttempts: settings.maxRetryAttempts || 3,
        timeoutThreshold: settings.timeoutThreshold || 5000,
        maintenanceMode: settings.maintenanceMode || false,
        debugMode: settings.debugMode || false
      })
    }
    setIsEditing(false)
  }

  const formatInterval = (seconds: number) => {
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatTimeout = (ms: number) => {
    if (ms >= 1000) return `${ms / 1000}s`
    return `${ms}ms`
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Configuration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure system-wide settings and parameters
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Settings
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* System Status */}
      {status && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${status.maintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">System Status</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {status.maintenanceMode ? 'Maintenance Mode' : 'Operational'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BugAntIcon className={`w-5 h-5 ${status.debugMode ? 'text-yellow-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Debug Mode</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {status.debugMode ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ClockIcon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Health Check</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatInterval(status.healthCheckInterval)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ServerIcon className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {status.lastUpdated ? new Date(status.lastUpdated).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => toggleMaintenanceMutation.mutate()}
            disabled={toggleMaintenanceMutation.isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              status?.maintenanceMode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            } disabled:opacity-50`}
          >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            <span>
              {toggleMaintenanceMutation.isPending
                ? 'Toggling...'
                : status?.maintenanceMode
                  ? 'Exit Maintenance Mode'
                  : 'Enter Maintenance Mode'
              }
            </span>
          </button>
          <button
            onClick={() => toggleDebugMutation.mutate()}
            disabled={toggleDebugMutation.isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              status?.debugMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            } disabled:opacity-50`}
          >
            <BugAntIcon className="w-4 h-4" />
            <span>
              {toggleDebugMutation.isPending
                ? 'Toggling...'
                : status?.debugMode
                  ? 'Disable Debug Mode'
                  : 'Enable Debug Mode'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Configuration Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuration Settings
        </h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Health Check Interval (seconds)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="30"
                  max="3600"
                  value={formData.healthCheckInterval}
                  onChange={(e) => setFormData({...formData, healthCheckInterval: parseInt(e.target.value) || 300})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatInterval(formData.healthCheckInterval)} ({formData.healthCheckInterval}s)
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How often to check service health (30 seconds to 1 hour)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification Retention (days)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.notificationRetention}
                  onChange={(e) => setFormData({...formData, notificationRetention: parseInt(e.target.value) || 30})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-gray-900 dark:text-white font-medium">
                  {formData.notificationRetention} days
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                How long to keep notification history (1 day to 1 year)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Retry Attempts
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxRetryAttempts}
                  onChange={(e) => setFormData({...formData, maxRetryAttempts: parseInt(e.target.value) || 3})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-gray-900 dark:text-white font-medium">
                  {formData.maxRetryAttempts} attempts
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum retry attempts for failed operations (1-10)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout Threshold (milliseconds)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1000"
                  max="30000"
                  value={formData.timeoutThreshold}
                  onChange={(e) => setFormData({...formData, timeoutThreshold: parseInt(e.target.value) || 5000})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="text-gray-900 dark:text-white font-medium">
                  {formatTimeout(formData.timeoutThreshold)} ({formData.timeoutThreshold}ms)
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Request timeout threshold (1 to 30 seconds)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}