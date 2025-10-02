/**
 * Health Monitoring Hook
 * Comprehensive system health monitoring and management
 */

import React, { useState, useCallback, useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { 
  type SystemHealth,
  type ComponentHealth,
  type HealthMonitoringFilters,
  type HealthTrend,
  type HealthIssue,
  type ActiveIncident,
  type MaintenanceWindow
} from '../types/health.types'

interface UseHealthMonitoringParams {
  refreshInterval?: number
  includeComponents?: boolean
  timeRange?: string
}

export function useHealthMonitoring(params: UseHealthMonitoringParams = {}) {
  const { 
    refreshInterval = 30000, 
    includeComponents = true, 
    timeRange = '24h' 
  } = params

  const [filters, setFilters] = useState<HealthMonitoringFilters>({
    timeRange,
    includeResolved: false
  })
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])

  const utils = trpc.useUtils()

  // Queries
  const {
    data: systemHealth,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = trpc.health.getSystemHealth.useQuery({
    includeComponents,
    timeRange: filters.timeRange || '24h'
  }, {
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  })

  const {
    data: healthTrends,
    isLoading: isLoadingTrends,
    error: trendsError,
    refetch: refetchTrends
  } = trpc.health.getHealthTrends.useQuery({
    timeRange: filters.timeRange || '24h',
    components: selectedComponents.length > 0 ? selectedComponents : undefined
  })

  const {
    data: healthIssues,
    isLoading: isLoadingIssues,
    error: issuesError,
    refetch: refetchIssues
  } = trpc.health.getHealthIssues.useQuery(filters)

  const {
    data: activeIncidents,
    isLoading: isLoadingIncidents,
    error: incidentsError,
    refetch: refetchIncidents
  } = trpc.health.getActiveIncidents.useQuery()

  const {
    data: maintenanceWindows,
    isLoading: isLoadingMaintenance,
    error: maintenanceError,
    refetch: refetchMaintenance
  } = trpc.health.getMaintenanceWindows.useQuery({
    upcoming: true,
    limit: 10
  })

  const {
    data: systemUptime,
    isLoading: isLoadingUptime,
    error: uptimeError,
    refetch: refetchUptime
  } = trpc.health.getSystemUptime.useQuery({
    period: 'daily'
  })

  // Mutations
  const acknowledgeIssueMutation = trpc.health.acknowledgeIssue.useMutation({
    onSuccess: () => {
      utils.health.getHealthIssues.invalidate()
    }
  })

  const createIncidentMutation = trpc.health.createIncident.useMutation({
    onSuccess: () => {
      utils.health.getActiveIncidents.invalidate()
    }
  })

  const scheduleMaintenanceMutation = trpc.health.scheduleMaintenanceWindow.useMutation({
    onSuccess: () => {
      utils.health.getMaintenanceWindows.invalidate()
    }
  })

  // Actions
  const updateFilters = useCallback((newFilters: Partial<HealthMonitoringFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const updateComponentSelection = useCallback((componentIds: string[]) => {
    setSelectedComponents(componentIds)
  }, [])

  const acknowledgeIssue = useCallback(async (issueId: string) => {
    try {
      const result = await acknowledgeIssueMutation.mutateAsync({ issueId })
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to acknowledge issue:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to acknowledge issue' 
      }
    }
  }, [acknowledgeIssueMutation])

  const createIncident = useCallback(async (incidentData: {
    title: string
    description: string
    severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
    affectedComponents?: string[]
    affectedServices?: string[]
    impactedUsers?: number
    assignedTo?: string
    tags?: string[]
  }) => {
    try {
      const result = await createIncidentMutation.mutateAsync(incidentData)
      return { success: true, incident: result }
    } catch (error) {
      console.error('Failed to create incident:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create incident' 
      }
    }
  }, [createIncidentMutation])

  const scheduleMaintenance = useCallback(async (maintenanceData: {
    title: string
    description: string
    type: 'PLANNED' | 'EMERGENCY'
    startTime: Date
    endTime: Date
    affectedServices?: string[]
    impactLevel?: 'NO_IMPACT' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT'
    notificationsSent?: boolean
  }) => {
    try {
      const result = await scheduleMaintenanceMutation.mutateAsync(maintenanceData)
      return { success: true, maintenance: result }
    } catch (error) {
      console.error('Failed to schedule maintenance:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to schedule maintenance' 
      }
    }
  }, [scheduleMaintenanceMutation])

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refetchHealth(),
      refetchTrends(),
      refetchIssues(),
      refetchIncidents(),
      refetchMaintenance(),
      refetchUptime()
    ])
  }, [refetchHealth, refetchTrends, refetchIssues, refetchIncidents, refetchMaintenance, refetchUptime])

  // Computed values
  const isLoading = useMemo(() => 
    isLoadingHealth || isLoadingTrends || isLoadingIssues || isLoadingIncidents || isLoadingMaintenance || isLoadingUptime,
    [isLoadingHealth, isLoadingTrends, isLoadingIssues, isLoadingIncidents, isLoadingMaintenance, isLoadingUptime]
  )

  const hasError = useMemo(() => 
    healthError || trendsError || issuesError || incidentsError || maintenanceError || uptimeError,
    [healthError, trendsError, issuesError, incidentsError, maintenanceError, uptimeError]
  )

  const criticalIssues = useMemo(() => {
    if (!healthIssues) return []
    return healthIssues.filter(issue => 
      issue.severity === 'CRITICAL' && !issue.isAcknowledged
    )
  }, [healthIssues])

  const healthyComponents = useMemo(() => {
    if (!systemHealth?.components) return []
    return systemHealth.components.filter(component => 
      component.status === 'OPERATIONAL'
    )
  }, [systemHealth])

  const unhealthyComponents = useMemo(() => {
    if (!systemHealth?.components) return []
    return systemHealth.components.filter(component => 
      component.status !== 'OPERATIONAL'
    )
  }, [systemHealth])

  const systemHealthScore = useMemo(() => {
    return systemHealth?.score || 0
  }, [systemHealth])

  const overallStatus = useMemo(() => {
    return systemHealth?.overall || 'MAJOR_OUTAGE'
  }, [systemHealth])

  const upcomingMaintenance = useMemo(() => {
    if (!maintenanceWindows) return []
    const now = new Date()
    return maintenanceWindows.filter(maintenance => 
      new Date(maintenance.startTime) > now
    ).slice(0, 3)
  }, [maintenanceWindows])

  // Auto-refresh setup
  React.useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(() => {
      // Silently refresh critical data
      refetchHealth()
      refetchIssues()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, refetchHealth, refetchIssues])

  return {
    // Data
    systemHealth: systemHealth || {
      overall: 'MAJOR_OUTAGE',
      score: 0,
      lastUpdated: new Date(),
      components: [],
      metrics: {
        totalServices: 0,
        healthyServices: 0,
        degradedServices: 0,
        failedServices: 0,
        avgResponseTime: 0,
        totalRequests: 0,
        successRate: 0,
        activeAlerts: 0,
        criticalAlerts: 0,
        systemLoad: 0,
        memoryUsage: 0,
        diskUsage: 0
      },
      incidents: [],
      uptime: {
        current: { uptime: 0, downtime: 100, startTime: new Date() },
        daily: { today: 0, yesterday: 0, last7Days: [] },
        monthly: { thisMonth: 0, lastMonth: 0, last12Months: [] },
        yearly: { thisYear: 0, lastYear: 0 }
      }
    } as SystemHealth,
    healthTrends: healthTrends || [],
    healthIssues: healthIssues || [],
    activeIncidents: activeIncidents || [],
    maintenanceWindows: maintenanceWindows || [],
    systemUptime: systemUptime || [],

    // Computed data
    criticalIssues,
    healthyComponents,
    unhealthyComponents,
    systemHealthScore,
    overallStatus,
    upcomingMaintenance,

    // State
    filters,
    selectedComponents,

    // Loading states
    isLoading,
    isLoadingHealth,
    isLoadingTrends,
    isLoadingIssues,
    isLoadingIncidents,
    isLoadingMaintenance,
    isLoadingUptime,
    isSubmitting: acknowledgeIssueMutation.isPending || 
                  createIncidentMutation.isPending || 
                  scheduleMaintenanceMutation.isPending,

    // Error states
    hasError,
    error: hasError ? (
      healthError || trendsError || issuesError || incidentsError || maintenanceError || uptimeError
    ) : null,

    // Actions
    updateFilters,
    updateComponentSelection,
    acknowledgeIssue,
    createIncident,
    scheduleMaintenance,
    refreshAllData
  }
}

// Hook for specific component health monitoring
export function useComponentHealth(componentId: string, timeRange = '24h') {
  const {
    data: componentHealth,
    isLoading,
    error,
    refetch
  } = trpc.health.getComponentHealth.useQuery({ componentId, timeRange })

  return {
    componentHealth,
    isLoading,
    error,
    refetch
  }
}

// Hook for dashboard health widgets
export function useDashboardHealth(timeRange = '1h') {
  const {
    data: systemHealth,
    isLoading: isLoadingHealth
  } = trpc.health.getSystemHealth.useQuery({ 
    includeComponents: false, 
    timeRange 
  }, {
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  const {
    data: healthIssues,
    isLoading: isLoadingIssues
  } = trpc.health.getHealthIssues.useQuery({ 
    timeRange, 
    includeResolved: false 
  })

  const criticalCount = useMemo(() => {
    if (!healthIssues) return 0
    return healthIssues.filter(issue => issue.severity === 'CRITICAL').length
  }, [healthIssues])

  const warningCount = useMemo(() => {
    if (!healthIssues) return 0
    return healthIssues.filter(issue => issue.severity === 'WARNING').length
  }, [healthIssues])

  return {
    systemHealth,
    healthIssues,
    criticalCount,
    warningCount,
    isLoading: isLoadingHealth || isLoadingIssues,
    overallStatus: systemHealth?.overall || 'MAJOR_OUTAGE',
    healthScore: systemHealth?.score || 0
  }
}