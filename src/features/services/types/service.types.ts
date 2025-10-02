/**
 * Service Configuration Types
 * Advanced service configuration and monitoring types
 */

import { Status } from '@prisma/client'

export interface Service {
  id: string
  name: string
  url: string
  description: string | null
  category: string
  status?: Status // For transformed services from currentStatus
  isActive: boolean
  icon: string | null
  healthCheckUrl?: string | null // For the configurator
  healthEndpoint?: string | null
  expectedResponseTime?: number | null
  retryAttempts?: number | null
  timeout?: number | null
  timeoutSeconds?: number
  createdAt: Date
  updatedAt: Date
  currentStatus?: {
    id: string
    serviceId: string
    status: Status
    responseTime: number | null
    statusCode: number | null
    errorMessage: string | null
    checkedAt: Date
  }
}

export interface ServiceStatus {
  id: string
  serviceId: string
  status: Status
  responseTime: number
  statusCode?: number | null
  errorMessage?: string | null
  checkedAt: Date
}

export interface ServiceConfiguration {
  id: string
  name: string
  url: string
  description: string
  category: string
  icon?: string
  
  // Health Check Configuration
  healthCheckUrl?: string
  healthEndpoint?: string
  expectedResponseTime?: number
  timeoutSeconds?: number
  retryAttempts?: number
  checkInterval?: number
  
  // Monitoring Configuration
  enableAlerts: boolean
  alertThreshold?: number
  alertCooldown?: number
  
  // Security Configuration
  authRequired: boolean
  authType?: 'basic' | 'bearer' | 'api-key' | 'custom'
  authHeaders?: Record<string, string>
  
  // Advanced Options
  followRedirects: boolean
  validateSSL: boolean
  customHeaders?: Record<string, string>
  tags: string[]
  
  // Dependencies
  dependencies: string[]
  dependents: string[]
}

export interface ServiceTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  defaultConfig: Partial<ServiceConfiguration>
  requiredFields: string[]
}

export interface ServiceGroup {
  id: string
  name: string
  description: string
  color: string
  services: string[]
}

export interface ServiceMetrics {
  serviceId: string
  serviceName: string
  uptime: number
  avgResponseTime: number
  successRate: number
  totalChecks: number
  successfulChecks: number
  failedChecks: number
  lastCheck: Date
  status: Status
}

export interface ServiceAlert {
  id: string
  serviceId: string
  type: 'down' | 'slow' | 'timeout' | 'error'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  triggeredAt: Date
  resolvedAt?: Date
  isResolved: boolean
}

export interface CreateServiceInput {
  name: string
  url: string
  description: string
  category: string
  icon?: string
  healthCheckUrl?: string
  healthEndpoint?: string
  expectedResponseTime?: number
  timeoutSeconds?: number
  retryAttempts?: number
  enableAlerts?: boolean
  authRequired?: boolean
  authType?: string
  followRedirects?: boolean
  validateSSL?: boolean
  tags?: string[]
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string
}

export interface ServiceFilters {
  category?: string
  status?: Status
  tag?: string
  group?: string
  search?: string
  isActive?: boolean
}

// Component Props
export interface ServiceConfiguratorProps {
  service?: Service
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateServiceInput | UpdateServiceInput) => Promise<void>
  isLoading?: boolean
}

export interface ServiceTemplatePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: ServiceTemplate) => void
  templates: ServiceTemplate[]
}

export interface ServiceGroupManagerProps {
  groups: ServiceGroup[]
  services: Service[]
  onCreateGroup: (group: Omit<ServiceGroup, 'id'>) => void
  onUpdateGroup: (group: ServiceGroup) => void
  onDeleteGroup: (groupId: string) => void
}

export interface ServiceDependencyMapperProps {
  services: Service[]
  selectedService?: Service
  onUpdateDependencies: (serviceId: string, dependencies: string[]) => void
}

export interface ServiceMetricsDashboardProps {
  services: Service[]
  metrics: ServiceMetrics[]
  timeRange: '1h' | '24h' | '7d' | '30d'
  onTimeRangeChange: (range: '1h' | '24h' | '7d' | '30d') => void
}

export interface ServiceAlertsManagerProps {
  alerts: ServiceAlert[]
  services: Service[]
  onResolveAlert: (alertId: string) => void
  onCreateAlert: (alert: Omit<ServiceAlert, 'id' | 'triggeredAt' | 'isResolved'>) => void
}