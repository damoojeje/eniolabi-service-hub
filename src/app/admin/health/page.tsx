'use client'

/**
 * Admin Health Monitoring Page
 * Comprehensive system health dashboard and monitoring
 */

import React, { useState } from 'react'
import { 
  HeartIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid'
import { useHealthMonitoring, useDashboardHealth } from '@/features/health-monitoring/hooks/useHealthMonitoring'
import { useNotifications } from '@/contexts/NotificationContext'

type TabType = 'overview' | 'components' | 'incidents' | 'maintenance' | 'trends' | 'settings'

export default function AdminHealthPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  const { addToast } = useNotifications()
  
  const {
    systemHealth,
    healthTrends,
    healthIssues,
    activeIncidents,
    maintenanceWindows,
    systemUptime,
    criticalIssues,
    healthyComponents,
    unhealthyComponents,
    systemHealthScore,
    overallStatus,
    upcomingMaintenance,
    isLoading,
    acknowledgeIssue,
    createIncident,
    scheduleMaintenance,
    refreshAllData,
    updateFilters
  } = useHealthMonitoring({ 
    refreshInterval: 30000,
    timeRange: selectedTimeRange 
  })

  const handleAcknowledgeIssue = async (issueId: string) => {
    const result = await acknowledgeIssue(issueId)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Issue acknowledged successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to acknowledge issue'
      })
    }
  }

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange)
    updateFilters({ timeRange })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
      case 'DEGRADED':
        return <ExclamationTriangleIconSolid className="h-6 w-6 text-yellow-500" />
      case 'PARTIAL_OUTAGE':
        return <ExclamationTriangleIconSolid className="h-6 w-6 text-orange-500" />
      case 'MAJOR_OUTAGE':
        return <XCircleIconSolid className="h-6 w-6 text-red-500" />
      default:
        return <HeartIconSolid className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 dark:text-green-400'
      case 'DEGRADED': return 'text-yellow-600 dark:text-yellow-400'
      case 'PARTIAL_OUTAGE': return 'text-orange-600 dark:text-orange-400'
      case 'MAJOR_OUTAGE': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: ChartBarIcon },
    { id: 'components' as const, name: 'Components', icon: ServerIcon },
    { id: 'incidents' as const, name: 'Incidents', icon: ExclamationTriangleIcon },
    { id: 'maintenance' as const, name: 'Maintenance', icon: CogIcon },
    { id: 'trends' as const, name: 'Trends', icon: HeartIcon },
    { id: 'settings' as const, name: 'Settings', icon: ShieldCheckIcon }
  ]

  const timeRangeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    System Health
                  </h1>
                  <p className={`text-sm font-medium ${getStatusColor(overallStatus)}`}>
                    {overallStatus.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} - 
                    Score: {systemHealthScore}/100
                  </p>
                </div>
              </div>
              
              {isLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-3 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={refreshAllData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ServerIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemHealth.metrics.totalServices}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthy</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemHealth.metrics.healthyServices}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Degraded</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemHealth.metrics.degradedServices}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <XCircleIconSolid className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemHealth.metrics.failedServices}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BellAlertIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {criticalIssues.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalIssues.length > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIconSolid className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Critical Issues Detected
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <ul className="list-disc list-inside space-y-1">
                    {criticalIssues.slice(0, 3).map(issue => (
                      <li key={issue.id}>{issue.title}</li>
                    ))}
                    {criticalIssues.length > 3 && (
                      <li>And {criticalIssues.length - 3} more critical issues...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } transition-colors`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'overview' && (
            <HealthOverview 
              systemHealth={systemHealth}
              healthIssues={healthIssues}
              upcomingMaintenance={upcomingMaintenance}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'components' && (
            <ComponentsView 
              components={systemHealth.components}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView 
              incidents={activeIncidents}
              healthIssues={healthIssues}
              onAcknowledgeIssue={handleAcknowledgeIssue}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView 
              maintenanceWindows={maintenanceWindows}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsView 
              healthTrends={healthTrends}
              systemUptime={systemUptime}
              timeRange={selectedTimeRange}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'settings' && (
            <HealthSettings 
              systemHealth={systemHealth}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function HealthOverview({ 
  systemHealth, 
  healthIssues, 
  upcomingMaintenance, 
  isLoading 
}: { 
  systemHealth: any
  healthIssues: any[]
  upcomingMaintenance: any[]
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          System Overview
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Score Card */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Health Score
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="transparent"
                    className="dark:stroke-gray-600"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={systemHealth.score >= 80 ? '#10b981' : 
                           systemHealth.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(systemHealth.score / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {systemHealth.score}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overall system health score
              </p>
            </div>
          </div>

          {/* Recent Issues */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Recent Issues
            </h3>
            {healthIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No issues detected
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {healthIssues.slice(0, 5).map(issue => (
                  <div key={issue.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      issue.severity === 'CRITICAL' ? 'bg-red-500' :
                      issue.severity === 'ERROR' ? 'bg-orange-500' :
                      issue.severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {issue.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(issue.detectedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Maintenance */}
      {upcomingMaintenance.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Upcoming Maintenance
          </h3>
          <div className="space-y-3">
            {upcomingMaintenance.map(maintenance => (
              <div key={maintenance.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {maintenance.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {maintenance.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    maintenance.impactLevel === 'SIGNIFICANT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    maintenance.impactLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {maintenance.impactLevel.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    {new Date(maintenance.startTime).toLocaleString()}
                  </span>
                  <span>Duration: {Math.round((new Date(maintenance.endTime).getTime() - new Date(maintenance.startTime).getTime()) / (1000 * 60))} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ComponentsView({ components, isLoading }: { components: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }

  if (components.length === 0) {
    return (
      <div className="text-center py-12">
        <ServerIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          No components
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No system components are currently being monitored.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        System Components
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map(component => (
          <div key={component.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ServerIcon className="h-5 w-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {component.name}
                </h3>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                component.status === 'OPERATIONAL' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                component.status === 'DEGRADED_PERFORMANCE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {component.status.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Health Score:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {component.healthScore}/100
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {component.uptime.toFixed(1)}%
                </span>
              </div>
              
              {component.responseTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {component.responseTime}ms
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Last Checked:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(component.lastChecked).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function IncidentsView({ 
  incidents, 
  healthIssues, 
  onAcknowledgeIssue, 
  isLoading 
}: { 
  incidents: any[]
  healthIssues: any[]
  onAcknowledgeIssue: (id: string) => void
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }

  const allIssues = [...incidents, ...healthIssues]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Issues & Incidents
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {allIssues.length} total issues
        </span>
      </div>
      
      {allIssues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No issues or incidents
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All systems are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {healthIssues.map(issue => (
            <div key={issue.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    issue.severity === 'CRITICAL' ? 'bg-red-500' :
                    issue.severity === 'ERROR' ? 'bg-orange-500' :
                    issue.severity === 'WARNING' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {issue.description}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Detected: {new Date(issue.detectedAt).toLocaleString()}</span>
                      <span>Impact: {issue.impact}</span>
                      <span>Type: {issue.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!issue.isAcknowledged && (
                    <button
                      onClick={() => onAcknowledgeIssue(issue.id)}
                      className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    issue.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    issue.severity === 'ERROR' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                    issue.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaintenanceView({ maintenanceWindows, isLoading }: { maintenanceWindows: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Maintenance Windows
        </h2>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Schedule Maintenance
        </button>
      </div>
      
      {maintenanceWindows.length === 0 ? (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No scheduled maintenance
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No maintenance windows are currently scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenanceWindows.map(maintenance => (
            <div key={maintenance.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {maintenance.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {maintenance.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      <ClockIcon className="h-3 w-3 inline mr-1" />
                      {new Date(maintenance.startTime).toLocaleString()}
                    </span>
                    <span>Type: {maintenance.type}</span>
                    <span>Impact: {maintenance.impactLevel}</span>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  maintenance.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  maintenance.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {maintenance.status.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TrendsView({ 
  healthTrends, 
  systemUptime, 
  timeRange, 
  isLoading 
}: { 
  healthTrends: any[]
  systemUptime: any[]
  timeRange: string
  isLoading: boolean 
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Health Trends
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Health Score Over Time
          </h3>
          <div className="h-48 flex items-end space-x-2">
            {healthTrends.slice(0, 24).map((trend, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t ${
                    trend.overallHealth >= 95 ? 'bg-green-500' :
                    trend.overallHealth >= 80 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ height: `${trend.overallHealth}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(trend.timestamp).getHours()}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Response Time Trends
          </h3>
          <div className="h-48 flex items-end space-x-2">
            {healthTrends.slice(0, 24).map((trend, index) => {
              const maxResponseTime = Math.max(...healthTrends.map(t => t.responseTime))
              const height = maxResponseTime > 0 ? (trend.responseTime / maxResponseTime) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(trend.timestamp).getHours()}:00
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          System Uptime
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {systemUptime.map((uptimeData, index) => (
            <div key={index} className="text-center">
              <div className={`w-full h-8 rounded mb-2 ${
                uptimeData.uptime >= 99 ? 'bg-green-500' :
                uptimeData.uptime >= 95 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500">
                {new Date(uptimeData.period).toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {uptimeData.uptime.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HealthSettings({ systemHealth, isLoading }: { systemHealth: any, isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Health Monitoring Settings
      </h2>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Monitoring Configuration
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Health monitoring settings will be available in a future update.
        </p>
      </div>
    </div>
  )
}

// Import the missing ArrowPathIcon
import { ArrowPathIcon } from '@heroicons/react/24/outline'