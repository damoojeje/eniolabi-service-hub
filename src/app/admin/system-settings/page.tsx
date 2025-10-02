'use client'

/**
 * System Settings Page
 * Comprehensive system configuration interface
 */

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  CogIcon, 
  ServerIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useNotifications } from '@/contexts/NotificationContext'

interface SettingCardProps {
  title: string
  description: string
  icon: React.ComponentType<any>
  children: React.ReactNode
  category?: 'general' | 'performance' | 'notifications' | 'maintenance' | 'debug'
}

function SettingCard({ title, description, icon: Icon, children, category = 'general' }: SettingCardProps) {
  const categoryColors = {
    general: 'border-blue-200 bg-blue-50',
    performance: 'border-green-200 bg-green-50',
    notifications: 'border-yellow-200 bg-yellow-50',
    maintenance: 'border-orange-200 bg-orange-50',
    debug: 'border-purple-200 bg-purple-50'
  }

  const iconColors = {
    general: 'text-blue-600',
    performance: 'text-green-600',
    notifications: 'text-yellow-600',
    maintenance: 'text-orange-600',
    debug: 'text-purple-600'
  }

  return (
    <div className={`p-6 rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${categoryColors[category]} dark:bg-gray-800 dark:border-gray-700`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-700 ${iconColors[category]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

interface InputFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
  disabled?: boolean
}

function InputField({ label, value, onChange, min, max, suffix, disabled }: InputFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
          disabled={disabled}
          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
        />
        {suffix && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  )
}

interface ToggleSwitchProps {
  label: string
  description?: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

function ToggleSwitch({ label, description, enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function SystemSettingsPage() {
  const { addToast } = useNotifications()
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current settings
  const { data: settings, isLoading, refetch } = trpc.systemSettings.get.useQuery()
  const { data: status } = trpc.systemSettings.getStatus.useQuery()

  // Local state for form
  const [formData, setFormData] = useState({
    healthCheckInterval: settings?.healthCheckInterval || 300,
    notificationRetention: settings?.notificationRetention || 30,
    maxRetryAttempts: settings?.maxRetryAttempts || 3,
    timeoutThreshold: settings?.timeoutThreshold || 5000,
    maintenanceMode: settings?.maintenanceMode || false,
    debugMode: settings?.debugMode || false
  })

  // Update form when settings change
  React.useEffect(() => {
    if (settings) {
      setFormData({
        healthCheckInterval: settings.healthCheckInterval,
        notificationRetention: settings.notificationRetention,
        maxRetryAttempts: settings.maxRetryAttempts,
        timeoutThreshold: settings.timeoutThreshold,
        maintenanceMode: settings.maintenanceMode,
        debugMode: settings.debugMode
      })
      setHasChanges(false)
    }
  }, [settings])

  // Mutations
  const updateSettingsMutation = trpc.systemSettings.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Settings Updated',
        message: 'System settings have been saved successfully'
      })
      setHasChanges(false)
      refetch()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message
      })
    }
  })

  const toggleMaintenanceMutation = trpc.systemSettings.toggleMaintenanceMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Maintenance Mode Updated',
        message: `Maintenance mode has been ${formData.maintenanceMode ? 'disabled' : 'enabled'}`
      })
      refetch()
    }
  })

  const toggleDebugMutation = trpc.systemSettings.toggleDebugMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Debug Mode Updated',
        message: `Debug mode has been ${formData.debugMode ? 'disabled' : 'enabled'}`
      })
      refetch()
    }
  })

  const handleFieldChange = (field: string, value: number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updateSettingsMutation.mutate(formData)
  }

  const handleReset = () => {
    if (settings) {
      setFormData({
        healthCheckInterval: settings.healthCheckInterval,
        notificationRetention: settings.notificationRetention,
        maxRetryAttempts: settings.maxRetryAttempts,
        timeoutThreshold: settings.timeoutThreshold,
        maintenanceMode: settings.maintenanceMode,
        debugMode: settings.debugMode
      })
      setHasChanges(false)
    }
  }

  const handleToggleMaintenance = () => {
    const newValue = !formData.maintenanceMode
    setFormData(prev => ({ ...prev, maintenanceMode: newValue }))
    toggleMaintenanceMutation.mutate()
  }

  const handleToggleDebug = () => {
    const newValue = !formData.debugMode
    setFormData(prev => ({ ...prev, debugMode: newValue }))
    toggleDebugMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading system settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Admin
              </Link>
              <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure system-wide parameters and behavior</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || updateSettingsMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                {updateSettingsMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* System Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <ServerIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">System Status</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">Operational</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900 dark:text-white">Maintenance Mode</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${formData.maintenanceMode ? 'text-orange-600' : 'text-gray-400'}`}>
                {formData.maintenanceMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Debug Mode</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${formData.debugMode ? 'text-purple-600' : 'text-gray-400'}`}>
                {formData.debugMode ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Settings */}
          <SettingCard
            title="Performance Settings"
            description="Configure system performance and monitoring parameters"
            icon={CogIcon}
            category="performance"
          >
            <div className="space-y-4">
              <InputField
                label="Health Check Interval"
                value={formData.healthCheckInterval}
                onChange={(value) => handleFieldChange('healthCheckInterval', value)}
                min={30}
                max={3600}
                suffix="seconds"
              />
              <InputField
                label="Timeout Threshold"
                value={formData.timeoutThreshold}
                onChange={(value) => handleFieldChange('timeoutThreshold', value)}
                min={1000}
                max={30000}
                suffix="ms"
              />
              <InputField
                label="Max Retry Attempts"
                value={formData.maxRetryAttempts}
                onChange={(value) => handleFieldChange('maxRetryAttempts', value)}
                min={1}
                max={10}
                suffix="attempts"
              />
            </div>
          </SettingCard>

          {/* Notification Settings */}
          <SettingCard
            title="Notification Settings"
            description="Configure notification behavior and retention policies"
            icon={BellIcon}
            category="notifications"
          >
            <div className="space-y-4">
              <InputField
                label="Notification Retention"
                value={formData.notificationRetention}
                onChange={(value) => handleFieldChange('notificationRetention', value)}
                min={1}
                max={365}
                suffix="days"
              />
            </div>
          </SettingCard>

          {/* Maintenance Mode */}
          <SettingCard
            title="Maintenance Mode"
            description="Enable maintenance mode to temporarily disable services"
            icon={WrenchScrewdriverIcon}
            category="maintenance"
          >
            <div className="space-y-4">
              <ToggleSwitch
                label="Enable Maintenance Mode"
                description="Services will be temporarily unavailable to users"
                enabled={formData.maintenanceMode}
                onChange={handleToggleMaintenance}
                disabled={toggleMaintenanceMutation.isPending}
              />
            </div>
          </SettingCard>

          {/* Debug Settings */}
          <SettingCard
            title="Debug Settings"
            description="Enable debug features for troubleshooting and monitoring"
            icon={InformationCircleIcon}
            category="debug"
          >
            <div className="space-y-4">
              <ToggleSwitch
                label="Enable Debug Mode"
                description="Show detailed logs and debugging information"
                enabled={formData.debugMode}
                onChange={handleToggleDebug}
                disabled={toggleDebugMutation.isPending}
              />
            </div>
          </SettingCard>
        </div>

        {/* Warning Section */}
        {(formData.maintenanceMode || formData.debugMode) && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Special Modes Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc list-inside space-y-1">
                    {formData.maintenanceMode && (
                      <li>Maintenance mode is enabled - services may be temporarily unavailable</li>
                    )}
                    {formData.debugMode && (
                      <li>Debug mode is enabled - additional logging and debugging features are active</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}