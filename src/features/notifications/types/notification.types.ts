/**
 * Notification Management Types
 * Comprehensive notification system with preferences and delivery options
 */

export type NotificationType = 'service_down' | 'service_up' | 'slow_response' | 'maintenance' | 'security' | 'user_action' | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'webhook' | 'slack'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  userId: string
  serviceId?: string
  serviceName?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  readAt?: Date
  expiresAt?: Date
}

export interface NotificationPreferences {
  id: string
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  webhookEnabled: boolean
  slackEnabled: boolean
  preferences: {
    service_down: NotificationChannel[]
    service_up: NotificationChannel[]
    slow_response: NotificationChannel[]
    maintenance: NotificationChannel[]
    security: NotificationChannel[]
    user_action: NotificationChannel[]
    system: NotificationChannel[]
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:MM format
    endTime: string   // HH:MM format
    timezone: string
  }
  digestSettings: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly'
    time: string // HH:MM format
  }
  createdAt: Date
  updatedAt: Date
}

export interface NotificationRule {
  id: string
  name: string
  description: string
  isActive: boolean
  conditions: {
    serviceIds?: string[]
    types: NotificationType[]
    priorities: NotificationPriority[]
    keywords?: string[]
  }
  actions: {
    channels: NotificationChannel[]
    template?: string
    webhookUrl?: string
    slackChannel?: string
  }
  cooldown: number // minutes
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  subject: string
  body: string
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateNotificationInput {
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  userId: string
  serviceId?: string
  metadata?: Record<string, any>
  expiresAt?: Date
}

export interface UpdateNotificationInput extends Partial<CreateNotificationInput> {
  id: string
  isRead?: boolean
  readAt?: Date
}

export interface NotificationFilters {
  type?: NotificationType
  priority?: NotificationPriority
  isRead?: boolean
  serviceId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
  todayCount: number
  weekCount: number
}

export interface BulkNotificationAction {
  action: 'mark_read' | 'mark_unread' | 'delete'
  notificationIds: string[]
}

// Component Props
export interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  maxHeight?: number
}

export interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onAction?: (notification: Notification, action: string) => void
}

export interface NotificationFiltersProps {
  filters: NotificationFilters
  onFiltersChange: (filters: NotificationFilters) => void
  stats: NotificationStats
}

export interface NotificationSettingsProps {
  preferences: NotificationPreferences
  rules: NotificationRule[]
  templates: NotificationTemplate[]
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void
  onCreateRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateRule: (rule: NotificationRule) => void
  onDeleteRule: (ruleId: string) => void
  onTestRule: (ruleId: string) => void
}

export interface NotificationRuleFormProps {
  rule?: NotificationRule
  isOpen: boolean
  onClose: () => void
  onSave: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'> | NotificationRule) => Promise<void>
  services: Array<{ id: string; name: string }>
}

export interface NotificationTemplateFormProps {
  template?: NotificationTemplate
  isOpen: boolean
  onClose: () => void
  onSave: (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'> | NotificationTemplate) => Promise<void>
}