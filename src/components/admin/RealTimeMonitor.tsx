'use client'

import React, { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  BoltIcon,
  ShieldExclamationIcon,
  CpuChipIcon,
  ServerIcon
} from '@heroicons/react/24/outline'

interface HealthEvent {
  id: string
  timestamp: Date
  type: 'STATUS_CHANGE' | 'ALERT' | 'RECOVERY' | 'CHECK'
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  component: string
  message: string
  details?: any
}

export default function RealTimeMonitor() {
  const { addToast } = useNotifications()
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h')
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Real-time data queries with auto-refresh
  const { data: systemHealth, refetch: refetchHealth } = trpc.health.getSystemHealth.useQuery(
    { timeRange, includeComponents: true },
    {
      refetchInterval: isMonitoring ? 10000 : false, // 10 second refresh when monitoring
      refetchIntervalInBackground: false
    }
  )

  const { data: healthTrends } = trpc.health.getHealthTrends.useQuery(
    { timeRange },
    {
      refetchInterval: isMonitoring ? 30000 : false, // 30 second refresh
      refetchIntervalInBackground: false
    }
  )

  const { data: activeIncidents } = trpc.health.getActiveIncidents.useQuery(
    undefined,
    {
      refetchInterval: isMonitoring ? 15000 : false, // 15 second refresh
      refetchIntervalInBackground: false
    }
  )

  const { data: healthIssues } = trpc.health.getHealthIssues.useQuery(
    { timeRange, includeResolved: false },
    {
      refetchInterval: isMonitoring ? 10000 : false, // 10 second refresh
      refetchIntervalInBackground: false
    }
  )

  const { data: systemMetrics } = trpc.health.getSystemMetrics.useQuery(
    undefined,
    {
      refetchInterval: isMonitoring ? 5000 : false, // 5 second refresh
      refetchIntervalInBackground: false
    }
  )

  const manualCheckMutation = trpc.health.checkAllServices.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: 'Manual Check Complete',
        message: `Checked ${data.totalServices} services`
      })
      refetchHealth()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Check Failed',
        message: error.message
      })
    }
  })

  // Simulate real-time events based on health data changes
  useEffect(() => {
    if (!systemHealth || !isMonitoring) return

    const newEvents: HealthEvent[] = []

    // Generate events from component status
    systemHealth.components?.forEach(component => {
      if (component.status !== 'OPERATIONAL') {
        newEvents.push({
          id: `${component.id}-${Date.now()}`,
          timestamp: new Date(),
          type: 'ALERT',
          severity: component.status === 'MAJOR_OUTAGE' ? 'CRITICAL' : 'WARNING',
          component: component.name,
          message: `${component.name} is ${component.status.replace('_', ' ').toLowerCase()}`,
          details: { responseTime: component.responseTime, healthScore: component.healthScore }
        })
      }
    })

    // Generate events from health issues
    healthIssues?.forEach(issue => {
      newEvents.push({
        id: issue.id,
        timestamp: new Date(issue.detectedAt),
        type: 'ALERT',
        severity: issue.severity,
        component: issue.title.split(' ')[0],
        message: issue.title,
        details: { impact: issue.impact, description: issue.description }
      })
    })

    // Add new events to the beginning of the list
    if (newEvents.length > 0) {
      setEvents(prev => [...newEvents, ...prev].slice(0, 100)) // Keep last 100 events
    }
  }, [systemHealth, healthIssues, isMonitoring])

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring) {
      addToast({
        type: 'info',
        title: 'Monitoring Started',
        message: 'Real-time monitoring is now active'
      })
    } else {
      addToast({
        type: 'info',
        title: 'Monitoring Paused',
        message: 'Real-time monitoring has been paused'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'DEGRADED_PERFORMANCE': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'PARTIAL_OUTAGE': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
      case 'MAJOR_OUTAGE': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'WARNING': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'ERROR': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
      case 'CRITICAL': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Real-time System Monitor
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Live system health monitoring and event stream
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          <button
            onClick={() => manualCheckMutation.mutate()}
            disabled={manualCheckMutation.isPending}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${manualCheckMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Check All</span>
          </button>
          <button
            onClick={toggleMonitoring}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isMonitoring
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            <span>{isMonitoring ? 'Pause' : 'Start'} Monitor</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  systemHealth?.overall === 'HEALTHY' ? 'bg-green-500' :
                  systemHealth?.overall === 'DEGRADED' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {systemHealth?.overall || 'LOADING'}
                </p>
              </div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          {systemHealth && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Health Score: {systemHealth.score}%
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Issues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {healthIssues?.length || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {healthIssues?.filter(i => i.severity === 'CRITICAL').length || 0} critical
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemHealth?.metrics?.avgResponseTime || 0}ms
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {systemHealth?.metrics?.successRate || 0}% success rate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemHealth?.metrics?.healthyServices || 0}/{systemHealth?.metrics?.totalServices || 0}
              </p>
            </div>
            <ServerIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {systemHealth?.metrics?.degradedServices || 0} degraded, {systemHealth?.metrics?.failedServices || 0} failed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component Status */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Component Status
              </h3>
              <div className="flex items-center space-x-2">
                {isMonitoring && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Live</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {systemHealth?.components?.map((component) => (
                <div
                  key={component.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedComponent === component.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        component.status === 'OPERATIONAL' ? 'bg-green-500' :
                        component.status === 'DEGRADED_PERFORMANCE' ? 'bg-yellow-500' :
                        component.status === 'PARTIAL_OUTAGE' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{component.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {component.type} • Health: {component.healthScore}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                        {component.status.replace('_', ' ')}
                      </span>
                      {component.responseTime && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {component.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedComponent === component.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Availability:</span>
                        <span className="ml-2 font-medium">{component.metrics.availability}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Error Rate:</span>
                        <span className="ml-2 font-medium">{component.errorRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                        <span className="ml-2 font-medium">{component.uptime}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Last Check:</span>
                        <span className="ml-2 font-medium">{new Date(component.lastChecked).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Event Stream */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Events
              </h3>
              <div className="flex items-center space-x-2">
                {isMonitoring && (
                  <BoltIcon className="w-4 h-4 text-yellow-500 animate-pulse" />
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {events.length} events
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <EyeIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No events yet</p>
                  <p className="text-xs text-gray-400">Events will appear here as they occur</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-shrink-0 mt-0.5">
                      {event.type === 'ALERT' ? (
                        <ExclamationTriangleIcon className={`w-4 h-4 ${
                          event.severity === 'CRITICAL' ? 'text-red-500' :
                          event.severity === 'ERROR' ? 'text-orange-500' :
                          event.severity === 'WARNING' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.component}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {event.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {events.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEvents([])}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear all events
                </button>
              </div>
            )}
          </div>

          {/* Active Incidents */}
          {activeIncidents && activeIncidents.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Incidents
              </h3>
              <div className="space-y-3">
                {activeIncidents.map((incident: any) => (
                  <div key={incident.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-200">
                          {incident.title}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {incident.severity} • {incident.status}
                        </p>
                      </div>
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}