'use client'

/**
 * Health Monitoring Dashboard Page
 * Comprehensive health monitoring interface for services, system metrics, and historical data
 */

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  ServerIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CpuChipIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'

interface HealthMetric {
  label: string
  value: string | number
  status: 'healthy' | 'warning' | 'critical'
  description?: string
}

function HealthMetricCard({ label, value, status, description }: HealthMetric) {
  const statusConfig = {
    healthy: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-900 dark:text-green-100'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-yellow-900 dark:text-yellow-100'
    },
    critical: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-900 dark:text-red-100'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${config.textColor}`}>{label}</p>
          <p className={`text-2xl font-bold ${config.textColor} mt-1`}>{value}</p>
          {description && (
            <p className={`text-xs mt-1 ${config.textColor} opacity-80`}>{description}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${config.iconColor}`} />
      </div>
    </div>
  )
}

function ServiceHealthList({ services }: { services: any[] }) {
  if (!services || services.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No services found</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Health Status</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {services.map((service: any, index: number) => {
          const statusConfig = {
            ONLINE: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', icon: CheckCircleIcon },
            WARNING: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', icon: ExclamationTriangleIcon },
            ERROR: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', icon: XCircleIcon },
            OFFLINE: { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', icon: XCircleIcon }
          }
          
          const status = service.status || 'OFFLINE'
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OFFLINE
          const StatusIcon = config.icon
          
          return (
            <div key={service.id || index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{service.url}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.color}`}>
                    {status}
                  </span>
                  {service.responseTime && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {service.responseTime}ms
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {service.lastChecked ? new Date(service.lastChecked).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
              {service.errorMessage && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {service.errorMessage}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SystemMetricsPanel({ systemMetrics }: { systemMetrics: any }) {
  if (!systemMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Metrics</h3>
        <p className="text-gray-600 dark:text-gray-400">Loading system metrics...</p>
      </div>
    )
  }

  const getHealthStatus = (value: number, thresholds: { warning: number, critical: number }): 'healthy' | 'warning' | 'critical' => {
    if (value >= thresholds.critical) return 'critical'
    if (value >= thresholds.warning) return 'warning'
    return 'healthy'
  }

  const cpuUsage = systemMetrics.cpu || 0
  const memoryUsage = systemMetrics.memory || 0
  const diskUsage = systemMetrics.disk || 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthMetricCard
          label="CPU Usage"
          value={`${Math.round(cpuUsage)}%`}
          status={getHealthStatus(cpuUsage, { warning: 70, critical: 85 })}
          description="Current processor utilization"
        />
        <HealthMetricCard
          label="Memory Usage"
          value={`${Math.round(memoryUsage)}%`}
          status={getHealthStatus(memoryUsage, { warning: 80, critical: 90 })}
          description="RAM utilization"
        />
        <HealthMetricCard
          label="Disk Usage"
          value={`${Math.round(diskUsage)}%`}
          status={getHealthStatus(diskUsage, { warning: 80, critical: 90 })}
          description="Storage utilization"
        />
      </div>
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Last updated: {systemMetrics.timestamp ? new Date(systemMetrics.timestamp).toLocaleString() : 'Unknown'}
      </div>
    </div>
  )
}

export default function HealthMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)

  // Fetch health monitoring data
  const { data: systemHealth, isLoading: loadingHealth, refetch: refetchHealth } = trpc.health.getSystemHealth.useQuery({})
  const { data: serviceHistory, isLoading: loadingHistory } = trpc.health.getServiceHistory.useQuery({ 
    serviceId: 'all',
    timeRange: '24h'
  })
  const { data: systemMetrics, isLoading: loadingMetrics, refetch: refetchMetrics } = trpc.health.getSystemMetrics.useQuery()

  // Manual health check for all services
  const checkAllServicesMutation = trpc.health.checkAllServices.useMutation({
    onSuccess: () => {
      refetchHealth()
      refetchMetrics()
    }
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refetchHealth()
      refetchMetrics()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refetchHealth, refetchMetrics])

  const isLoading = loadingHealth || loadingHistory || loadingMetrics

  const handleManualRefresh = () => {
    checkAllServicesMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Admin
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalServices = systemHealth?.components?.length || 0
  const healthyServices = systemHealth?.components?.filter((s: any) => s.status === 'OPERATIONAL')?.length || 0
  const warningServices = systemHealth?.components?.filter((s: any) => s.status === 'DEGRADED_PERFORMANCE')?.length || 0
  const errorServices = systemHealth?.components?.filter((s: any) => s.status === 'PARTIAL_OUTAGE' || s.status === 'MAJOR_OUTAGE')?.length || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Admin
            </Link>
            <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Monitoring</h1>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="ml-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={checkAllServicesMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {checkAllServicesMutation.isPending ? 'Checking...' : 'Check All'}
            </button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <HealthMetricCard
            label="Total Services"
            value={totalServices}
            status="healthy"
            description="Monitored services"
          />
          <HealthMetricCard
            label="Healthy"
            value={healthyServices}
            status="healthy"
            description={`${totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 0}% uptime`}
          />
          <HealthMetricCard
            label="Warnings"
            value={warningServices}
            status={warningServices > 0 ? "warning" : "healthy"}
            description="Services with issues"
          />
          <HealthMetricCard
            label="Critical"
            value={errorServices}
            status={errorServices > 0 ? "critical" : "healthy"}
            description="Failed services"
          />
        </div>

        {/* System Metrics */}
        <div className="mb-8">
          <SystemMetricsPanel systemMetrics={systemMetrics} />
        </div>

        {/* Service Health Details */}
        <div className="space-y-8">
          <ServiceHealthList services={systemHealth?.components || []} />
        </div>

        {/* Recent Activity Log */}
        {serviceHistory && serviceHistory.history && serviceHistory.history.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Health Events</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
              {serviceHistory.history.slice(0, 20).map((event: any, index: number) => (
                <div key={event.id || index} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    {event.status === 'ONLINE' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : event.status === 'WARNING' ? (
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">{event.serviceName}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      changed to {event.status?.toLowerCase()}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-500">
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}