/**
 * System Health Monitoring Types
 * Comprehensive system health tracking and monitoring
 */

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE'

export type ComponentStatus = 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'UNDER_MAINTENANCE'

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export interface SystemHealth {
  overall: HealthStatus
  score: number // 0-100
  lastUpdated: Date
  components: ComponentHealth[]
  metrics: SystemMetrics
  incidents: ActiveIncident[]
  uptime: UptimeMetrics
}

export interface ComponentHealth {
  id: string
  name: string
  type: 'SERVICE' | 'DATABASE' | 'CACHE' | 'QUEUE' | 'STORAGE' | 'NETWORK' | 'EXTERNAL_API'
  status: ComponentStatus
  healthScore: number // 0-100
  description?: string
  lastChecked: Date
  responseTime?: number
  errorRate: number
  uptime: number
  dependencies: string[]
  metrics: ComponentMetrics
  issues: HealthIssue[]
}

export interface ComponentMetrics {
  availability: number
  responseTime: {
    current: number
    avg: number
    p95: number
    p99: number
  }
  throughput: {
    current: number
    avg: number
    peak: number
  }
  errorRate: {
    current: number
    avg: number
    threshold: number
  }
  resourceUsage?: {
    cpu?: number
    memory?: number
    disk?: number
    network?: number
  }
}

export interface SystemMetrics {
  totalServices: number
  healthyServices: number
  degradedServices: number
  failedServices: number
  avgResponseTime: number
  totalRequests: number
  successRate: number
  activeAlerts: number
  criticalAlerts: number
  systemLoad: number
  memoryUsage: number
  diskUsage: number
}

export interface HealthIssue {
  id: string
  componentId: string
  type: 'PERFORMANCE' | 'AVAILABILITY' | 'ERROR' | 'TIMEOUT' | 'DEPENDENCY'
  severity: AlertSeverity
  title: string
  description: string
  detectedAt: Date
  resolvedAt?: Date
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  affectedUsers?: number
  rootCause?: string
  resolution?: string
  isAcknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

export interface ActiveIncident {
  id: string
  title: string
  description: string
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  startTime: Date
  endTime?: Date
  duration?: number
  affectedComponents: string[]
  affectedServices: string[]
  impactedUsers: number
  updates: IncidentUpdate[]
  assignedTo?: string
  tags: string[]
}

export interface IncidentUpdate {
  id: string
  incidentId: string
  message: string
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'
  createdAt: Date
  createdBy: string
}

export interface UptimeMetrics {
  current: {
    uptime: number
    downtime: number
    startTime: Date
  }
  daily: {
    today: number
    yesterday: number
    last7Days: number[]
  }
  monthly: {
    thisMonth: number
    lastMonth: number
    last12Months: number[]
  }
  yearly: {
    thisYear: number
    lastYear: number
  }
}

export interface HealthCheck {
  id: string
  name: string
  description: string
  type: 'HTTP' | 'TCP' | 'DATABASE' | 'CUSTOM'
  target: string
  method?: string
  headers?: Record<string, string>
  body?: string
  timeout: number
  interval: number
  retryCount: number
  expectedStatus?: number
  expectedResponse?: string
  isEnabled: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface HealthCheckResult {
  id: string
  checkId: string
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' | 'ERROR'
  responseTime: number
  statusCode?: number
  responseBody?: string
  errorMessage?: string
  checkedAt: Date
  metadata?: Record<string, any>
}

export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  type: 'PLANNED' | 'EMERGENCY'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  startTime: Date
  endTime: Date
  affectedServices: string[]
  impactLevel: 'NO_IMPACT' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT'
  notificationsSent: boolean
  createdBy: string
  createdAt: Date
  updates: MaintenanceUpdate[]
}

export interface MaintenanceUpdate {
  id: string
  maintenanceId: string
  message: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date
  createdBy: string
}

export interface HealthDashboardConfig {
  id: string
  name: string
  isDefault: boolean
  layout: DashboardWidget[]
  refreshInterval: number
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface DashboardWidget {
  id: string
  type: 'SYSTEM_OVERVIEW' | 'SERVICE_GRID' | 'UPTIME_CHART' | 'RESPONSE_TIME_CHART' | 'ALERTS_LIST' | 'INCIDENTS_LIST' | 'MAINTENANCE_CALENDAR'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: {
    serviceIds?: string[]
    timeRange?: string
    showDetails?: boolean
    chartType?: 'line' | 'bar' | 'area'
    groupBy?: string
    filters?: Record<string, any>
  }
}

export interface HealthMonitoringFilters {
  components?: string[]
  statuses?: ComponentStatus[]
  severities?: AlertSeverity[]
  timeRange?: string
  startDate?: Date
  endDate?: Date
  includeResolved?: boolean
  tags?: string[]
}

export interface HealthTrend {
  timestamp: Date
  overallHealth: number
  componentHealth: Record<string, number>
  activeIncidents: number
  responseTime: number
  errorRate: number
  availability: number
}

// Component Props
export interface HealthDashboardProps {
  config?: HealthDashboardConfig
  isEditable?: boolean
  onConfigUpdate?: (config: HealthDashboardConfig) => void
}

export interface SystemStatusWidgetProps {
  systemHealth: SystemHealth
  showDetails?: boolean
  className?: string
}

export interface ServiceHealthGridProps {
  components: ComponentHealth[]
  viewMode: 'grid' | 'list'
  onComponentClick?: (component: ComponentHealth) => void
  filters?: HealthMonitoringFilters
  className?: string
}

export interface HealthTrendsChartProps {
  data: HealthTrend[]
  timeRange: string
  metrics: string[]
  className?: string
}

export interface AlertsPanelProps {
  issues: HealthIssue[]
  incidents: ActiveIncident[]
  onAcknowledge?: (issueId: string) => void
  onResolve?: (issueId: string) => void
  showFilters?: boolean
  className?: string
}

export interface MaintenanceCalendarProps {
  maintenanceWindows: MaintenanceWindow[]
  onSchedule?: (maintenance: Omit<MaintenanceWindow, 'id' | 'createdAt'>) => void
  onUpdate?: (maintenance: MaintenanceWindow) => void
  onCancel?: (maintenanceId: string) => void
  className?: string
}

export interface HealthCheckManagerProps {
  healthChecks: HealthCheck[]
  results: HealthCheckResult[]
  onCreate?: (check: Omit<HealthCheck, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate?: (check: HealthCheck) => void
  onDelete?: (checkId: string) => void
  onTest?: (checkId: string) => void
  className?: string
}