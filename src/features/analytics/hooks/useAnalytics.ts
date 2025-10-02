/**
 * Analytics Management Hook
 * Comprehensive analytics data fetching and management
 */

import React, { useState, useCallback, useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { 
  type TimeRange, 
  type AnalyticsFilters,
  type MetricType,
  type ServiceHealthMetrics,
  type SystemOverview
} from '../types/analytics.types'

interface UseAnalyticsParams {
  initialTimeRange?: TimeRange
  initialServiceIds?: string[]
}

export function useAnalytics(params: UseAnalyticsParams = {}) {
  const { initialTimeRange = '24h', initialServiceIds = [] } = params
  
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialServiceIds)
  const [selectedMetrics, setSelectedMetrics] = useState<('uptime' | 'response_time' | 'status_distribution')[]>(['uptime', 'response_time'])

  const utils = trpc.useUtils()

  // Queries
  const {
    data: systemOverview,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview
  } = trpc.analytics.getSystemOverview.useQuery({ timeRange })

  const {
    data: serviceMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = trpc.analytics.getServiceMetrics.useQuery({
    serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
    timeRange
  })

  const {
    data: timeSeriesData,
    isLoading: isLoadingTimeSeries,
    error: timeSeriesError,
    refetch: refetchTimeSeries
  } = trpc.analytics.getTimeSeriesData.useQuery({
    serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
    timeRange,
    metrics: selectedMetrics
  })

  const {
    data: alertsOverview,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = trpc.analytics.getAlertsOverview.useQuery({
    timeRange,
    serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined
  })

  const {
    data: serviceHealthMetrics,
    isLoading: isLoadingHealthMetrics,
    error: healthMetricsError,
    refetch: refetchHealthMetrics
  } = trpc.analytics.getServiceHealthMetrics.useQuery({
    serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
    timeRange
  })

  // Report generation mutation
  const generateReportMutation = trpc.analytics.generateReport.useMutation()

  // Actions
  const updateTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
  }, [])

  const updateServiceSelection = useCallback((serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds)
  }, [])

  const updateMetrics = useCallback((metrics: ('uptime' | 'response_time' | 'status_distribution')[]) => {
    setSelectedMetrics(metrics)
  }, [])

  const generateReport = useCallback(async (reportConfig: {
    name: string
    description?: string
    reportType: 'SERVICE' | 'SYSTEM' | 'SLA' | 'CUSTOM'
    services: string[]
    metrics: MetricType[]
    format: 'JSON' | 'PDF' | 'CSV' | 'XLSX'
  }) => {
    try {
      const report = await generateReportMutation.mutateAsync({
        ...reportConfig,
        timeRange
      })
      return { success: true, report }
    } catch (error) {
      console.error('Failed to generate report:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      }
    }
  }, [generateReportMutation, timeRange])

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refetchOverview(),
      refetchMetrics(),
      refetchTimeSeries(),
      refetchAlerts(),
      refetchHealthMetrics()
    ])
  }, [refetchOverview, refetchMetrics, refetchTimeSeries, refetchAlerts, refetchHealthMetrics])

  // Computed values
  const isLoading = useMemo(() => 
    isLoadingOverview || isLoadingMetrics || isLoadingTimeSeries || isLoadingAlerts || isLoadingHealthMetrics,
    [isLoadingOverview, isLoadingMetrics, isLoadingTimeSeries, isLoadingAlerts, isLoadingHealthMetrics]
  )

  const hasError = useMemo(() => 
    overviewError || metricsError || timeSeriesError || alertsError || healthMetricsError,
    [overviewError, metricsError, timeSeriesError, alertsError, healthMetricsError]
  )

  const topPerformingServices = useMemo(() => {
    if (!serviceHealthMetrics) return []
    return [...serviceHealthMetrics]
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, 5)
  }, [serviceHealthMetrics])

  const criticalServices = useMemo(() => {
    if (!serviceHealthMetrics) return []
    return serviceHealthMetrics.filter((service: ServiceHealthMetrics) => 
      service.currentStatus === 'ERROR' || 
      service.currentStatus === 'OFFLINE' ||
      service.healthScore < 70
    )
  }, [serviceHealthMetrics])

  const totalUptime = useMemo(() => {
    if (!serviceMetrics || serviceMetrics.length === 0) return 0
    const sum = serviceMetrics.reduce((acc, service) => acc + service.uptime, 0)
    return Math.round((sum / serviceMetrics.length) * 100) / 100
  }, [serviceMetrics])

  const avgResponseTime = useMemo(() => {
    if (!serviceMetrics || serviceMetrics.length === 0) return 0
    const sum = serviceMetrics.reduce((acc, service) => acc + service.avgResponseTime, 0)
    return Math.round(sum / serviceMetrics.length)
  }, [serviceMetrics])

  return {
    // Data
    systemOverview: systemOverview || {
      totalServices: 0,
      onlineServices: 0,
      warningServices: 0,
      errorServices: 0,
      offlineServices: 0,
      totalChecks: 0,
      avgUptime: 0,
      avgResponseTime: 0,
      activeIncidents: 0,
      resolvedIncidents: 0,
      slaCompliance: 0,
      healthScore: 0
    } as SystemOverview,
    serviceMetrics: serviceMetrics || [],
    timeSeriesData: timeSeriesData || {},
    alertsOverview: alertsOverview || {
      total: 0,
      active: 0,
      resolved: 0,
      byService: {},
      bySeverity: {},
      recentAlerts: [],
      trendsData: []
    },
    serviceHealthMetrics: serviceHealthMetrics || [],

    // Computed data
    topPerformingServices,
    criticalServices,
    totalUptime,
    avgResponseTime,

    // State
    timeRange,
    selectedServiceIds,
    selectedMetrics,

    // Loading states
    isLoading,
    isLoadingOverview,
    isLoadingMetrics,
    isLoadingTimeSeries,
    isLoadingAlerts,
    isLoadingHealthMetrics,
    isGeneratingReport: generateReportMutation.isPending,

    // Error states
    hasError,
    error: hasError ? (
      overviewError || metricsError || timeSeriesError || alertsError || healthMetricsError
    ) : null,

    // Actions
    updateTimeRange,
    updateServiceSelection,
    updateMetrics,
    generateReport,
    refreshAllData
  }
}

// Hook specifically for dashboard widgets
export function useDashboardAnalytics(serviceIds?: string[], timeRange: TimeRange = '24h') {
  const {
    data: systemOverview,
    isLoading: isLoadingOverview
  } = trpc.analytics.getSystemOverview.useQuery({ timeRange })

  const {
    data: serviceMetrics,
    isLoading: isLoadingMetrics
  } = trpc.analytics.getServiceMetrics.useQuery({
    serviceIds,
    timeRange
  })

  const {
    data: alertsOverview,
    isLoading: isLoadingAlerts
  } = trpc.analytics.getAlertsOverview.useQuery({
    timeRange,
    serviceIds
  })

  return {
    systemOverview,
    serviceMetrics,
    alertsOverview,
    isLoading: isLoadingOverview || isLoadingMetrics || isLoadingAlerts
  }
}

// Hook for real-time analytics updates
export function useRealTimeAnalytics(serviceIds?: string[], refreshInterval = 30000) {
  const utils = trpc.useUtils()

  const refreshData = useCallback(async () => {
    await Promise.all([
      utils.analytics.getSystemOverview.invalidate(),
      utils.analytics.getServiceMetrics.invalidate(),
      utils.analytics.getTimeSeriesData.invalidate(),
      utils.analytics.getAlertsOverview.invalidate(),
      utils.analytics.getServiceHealthMetrics.invalidate()
    ])
  }, [utils])

  // Set up auto-refresh
  React.useEffect(() => {
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshData, refreshInterval])

  return { refreshData }
}