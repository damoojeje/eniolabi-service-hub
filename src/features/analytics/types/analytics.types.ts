/**
 * Service Analytics & Reporting Types
 * Comprehensive analytics for service monitoring and performance tracking
 */

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d'

export type MetricType = 'uptime' | 'response_time' | 'status_distribution' | 'availability' | 'error_rate'

export interface ServiceMetrics {
  serviceId: string
  serviceName: string
  timeRange: TimeRange
  uptime: number // percentage
  avgResponseTime: number // milliseconds
  medianResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  totalChecks: number
  successfulChecks: number
  failedChecks: number
  errorRate: number // percentage
  availability: number // percentage
  lastChecked: Date
  currentStatus: 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE'
}

export interface ServiceHealthMetrics {
  serviceId: string
  serviceName: string
  category: string
  currentStatus: 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE'
  uptime: number
  downtime: number
  avgResponseTime: number
  lastIncident: Date | null
  incidentCount: number
  slaCompliance: number
  healthScore: number // 0-100
}

export interface TimeSeriesData {
  timestamp: Date
  value: number
  status?: 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE'
  responseTime?: number
  statusCode?: number
}

export interface ServiceAnalytics {
  serviceId: string
  serviceName: string
  timeRange: TimeRange
  metrics: ServiceMetrics
  timeSeries: {
    uptime: TimeSeriesData[]
    responseTime: TimeSeriesData[]
    statusDistribution: TimeSeriesData[]
  }
  incidents: ServiceIncident[]
  slaMetrics: SLAMetrics
}

export interface ServiceIncident {
  id: string
  serviceId: string
  serviceName: string
  title: string
  description: string
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  startTime: Date
  endTime?: Date
  duration?: number // minutes
  affectedServices: string[]
  impactedUsers?: number
  rootCause?: string
  resolution?: string
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface SLAMetrics {
  serviceId: string
  target: number // percentage (e.g., 99.9)
  actual: number // percentage
  compliance: number // percentage of time SLA was met
  breaches: SLABreach[]
  credits: number // SLA credits/penalties
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

export interface SLABreach {
  id: string
  serviceId: string
  startTime: Date
  endTime: Date
  duration: number // minutes
  targetUptime: number
  actualUptime: number
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  impactDescription: string
  creditAmount?: number
}

export interface AlertsOverview {
  total: number
  active: number
  resolved: number
  byService: Record<string, number>
  bySeverity: Record<string, number>
  recentAlerts: ServiceAlert[]
  trendsData: TimeSeriesData[]
}

export interface ServiceAlert {
  id: string
  serviceId: string
  serviceName: string
  type: 'DOWN' | 'SLOW' | 'ERROR' | 'RECOVERING'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  triggeredAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  acknowledgedBy?: string
  isActive: boolean
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  id: string
  name: string
  description: string
  reportType: 'SERVICE' | 'SYSTEM' | 'SLA' | 'CUSTOM'
  timeRange: TimeRange
  services: string[]
  metrics: MetricType[]
  generatedAt: Date
  generatedBy: string
  data: {
    summary: ServiceHealthMetrics[]
    timeSeries: Record<string, TimeSeriesData[]>
    incidents: ServiceIncident[]
    slaCompliance: SLAMetrics[]
  }
  format: 'JSON' | 'PDF' | 'CSV' | 'XLSX'
  isScheduled: boolean
  schedule?: {
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
    dayOfWeek?: number
    dayOfMonth?: number
    hour: number
    minute: number
    timezone: string
  }
}

export interface DashboardWidget {
  id: string
  type: 'UPTIME' | 'RESPONSE_TIME' | 'STATUS_DISTRIBUTION' | 'ALERTS' | 'INCIDENTS' | 'SLA'
  title: string
  serviceIds: string[]
  timeRange: TimeRange
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config: Record<string, any>
}

export interface AnalyticsFilters {
  serviceIds?: string[]
  categories?: string[]
  statuses?: Array<'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE'>
  timeRange: TimeRange
  startDate?: Date
  endDate?: Date
  groupBy?: 'service' | 'category' | 'status' | 'hour' | 'day' | 'week'
  metrics?: MetricType[]
}

export interface SystemOverview {
  totalServices: number
  onlineServices: number
  warningServices: number
  errorServices: number
  offlineServices: number
  totalChecks: number
  avgUptime: number
  avgResponseTime: number
  activeIncidents: number
  resolvedIncidents: number
  slaCompliance: number
  healthScore: number
}

// Component Props
export interface AnalyticsDashboardProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  widgets: DashboardWidget[]
  onWidgetUpdate: (widget: DashboardWidget) => void
  onWidgetAdd: (widget: Omit<DashboardWidget, 'id'>) => void
  onWidgetRemove: (widgetId: string) => void
}

export interface ServiceMetricsChartProps {
  serviceId: string
  timeRange: TimeRange
  metrics: MetricType[]
  data: TimeSeriesData[]
  isLoading?: boolean
}

export interface UptimeWidgetProps {
  serviceIds: string[]
  timeRange: TimeRange
  showDetails?: boolean
  className?: string
}

export interface ResponseTimeChartProps {
  serviceIds: string[]
  timeRange: TimeRange
  showP95?: boolean
  showP99?: boolean
  className?: string
}

export interface StatusDistributionChartProps {
  services: ServiceHealthMetrics[]
  groupBy: 'service' | 'category' | 'status'
  className?: string
}

export interface AlertsOverviewProps {
  timeRange: TimeRange
  serviceIds?: string[]
  showTrends?: boolean
  className?: string
}

export interface ReportBuilderProps {
  services: Array<{id: string; name: string; category: string}>
  onGenerate: (config: Omit<PerformanceReport, 'id' | 'generatedAt' | 'generatedBy' | 'data'>) => void
  onSchedule: (config: PerformanceReport) => void
  isLoading?: boolean
}

export interface IncidentTimelineProps {
  incidents: ServiceIncident[]
  timeRange: TimeRange
  serviceIds?: string[]
  showResolved?: boolean
  className?: string
}