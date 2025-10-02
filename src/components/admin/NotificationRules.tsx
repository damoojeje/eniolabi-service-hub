'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  BellIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  ServerIcon,
  BoltIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface NotificationRule {
  id: string
  name: string
  description?: string
  isActive: boolean
  conditions: {
    serviceIds?: string[]
    types: string[]
    priorities: string[]
    keywords?: string[]
  }
  actions: {
    channels: string[]
    template?: string
    webhookUrl?: string
    slackChannel?: string
  }
  cooldown: number
  creator?: {
    username: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

interface RuleFormData {
  name: string
  description: string
  isActive: boolean
  conditions: {
    serviceIds: string[]
    types: string[]
    priorities: string[]
    keywords: string[]
  }
  actions: {
    channels: string[]
    template: string
    webhookUrl: string
    slackChannel: string
  }
  cooldown: number
}

const EVENT_TYPES = [
  { value: 'service_down', label: 'Service Down', icon: '🔴', description: 'When a service goes offline' },
  { value: 'service_up', label: 'Service Up', icon: '🟢', description: 'When a service comes online' },
  { value: 'slow_response', label: 'Slow Response', icon: '⚠️', description: 'When response time is slow' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧', description: 'Maintenance notifications' },
  { value: 'security', label: 'Security', icon: '🔒', description: 'Security-related events' },
  { value: 'user_action', label: 'User Action', icon: '👤', description: 'User-triggered events' },
  { value: 'system', label: 'System', icon: '💻', description: 'System-level events' }
]

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
]

const NOTIFICATION_CHANNELS = [
  { value: 'in_app', label: 'In-App', icon: <BellIcon className="w-4 h-4" />, description: 'Browser notifications' },
  { value: 'email', label: 'Email', icon: '📧', description: 'Email notifications' },
  { value: 'sms', label: 'SMS', icon: '📱', description: 'SMS text messages' },
  { value: 'webhook', label: 'Webhook', icon: <BoltIcon className="w-4 h-4" />, description: 'HTTP webhooks' },
  { value: 'slack', label: 'Slack', icon: '💬', description: 'Slack messages' }
]

export default function NotificationRules() {
  const { addToast } = useNotifications()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)
  const [formData, setFormData] = useState<RuleFormData>({
    name: '',
    description: '',
    isActive: true,
    conditions: {
      serviceIds: [],
      types: [],
      priorities: [],
      keywords: []
    },
    actions: {
      channels: [],
      template: '',
      webhookUrl: '',
      slackChannel: ''
    },
    cooldown: 5
  })

  const { data: rules = [], isLoading, refetch } = trpc.notifications.getRules.useQuery()
  const { data: services = [] } = trpc.services.getAll.useQuery()

  const createMutation = trpc.notifications.createRule.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Rule Created',
        message: 'Notification rule has been created successfully'
      })
      refetch()
      resetForm()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const updateMutation = trpc.notifications.updateRule.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Rule Updated',
        message: 'Notification rule has been updated successfully'
      })
      refetch()
      resetForm()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const deleteMutation = trpc.notifications.deleteRule.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Rule Deleted',
        message: 'Notification rule has been deleted successfully'
      })
      refetch()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const testMutation = trpc.notifications.testRule.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Test Sent',
        message: 'Test notification has been sent successfully'
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true,
      conditions: {
        serviceIds: [],
        types: [],
        priorities: [],
        keywords: []
      },
      actions: {
        channels: [],
        template: '',
        webhookUrl: '',
        slackChannel: ''
      },
      cooldown: 5
    })
    setShowCreateModal(false)
    setEditingRule(null)
  }

  const handleEdit = (rule: NotificationRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      isActive: rule.isActive,
      conditions: {
        serviceIds: rule.conditions.serviceIds || [],
        types: rule.conditions.types,
        priorities: rule.conditions.priorities,
        keywords: rule.conditions.keywords || []
      },
      actions: {
        channels: rule.actions.channels,
        template: rule.actions.template || '',
        webhookUrl: rule.actions.webhookUrl || '',
        slackChannel: rule.actions.slackChannel || ''
      },
      cooldown: rule.cooldown
    })
    setShowCreateModal(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Rule name is required'
      })
      return
    }

    if (formData.conditions.types.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'At least one event type must be selected'
      })
      return
    }

    if (formData.actions.channels.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'At least one notification channel must be selected'
      })
      return
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      isActive: formData.isActive,
      conditions: {
        serviceIds: formData.conditions.serviceIds.length > 0 ? formData.conditions.serviceIds : undefined,
        types: formData.conditions.types as any,
        priorities: formData.conditions.priorities as any,
        keywords: formData.conditions.keywords.length > 0 ? formData.conditions.keywords : undefined
      },
      actions: {
        channels: formData.actions.channels as any,
        template: formData.actions.template || undefined,
        webhookUrl: formData.actions.webhookUrl || undefined,
        slackChannel: formData.actions.slackChannel || undefined
      },
      cooldown: formData.cooldown
    }

    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleArrayToggle = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(v => v !== value))
    } else {
      setter([...array, value])
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Rules
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automate notifications based on system events and conditions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Notification Rules
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first notification rule to automate system alerts
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create First Rule</span>
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rule.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      <span>Created by {rule.creator?.name || 'System'}</span>
                      <span>•</span>
                      <span>Cooldown: {rule.cooldown}m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rule.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => testMutation.mutate({ id: rule.id })}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
                    title="Test Rule"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(rule as any)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate({ id: rule.id })}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Conditions */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conditions</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Event Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.conditions && typeof rule.conditions === 'object' && 'types' in rule.conditions && Array.isArray((rule.conditions as any).types) ? (rule.conditions as any).types.map((type: any) => {
                          const eventType = EVENT_TYPES.find(e => e.value === type)
                          return (
                            <span key={type} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {eventType?.icon} {eventType?.label || type}
                            </span>
                          )
                        }) : null}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Priorities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.conditions && typeof rule.conditions === 'object' && 'priorities' in rule.conditions && Array.isArray((rule.conditions as any).priorities) ? (rule.conditions as any).priorities.map((priority: any) => {
                          const priorityLevel = PRIORITY_LEVELS.find(p => p.value === priority)
                          return (
                            <span key={priority} className={`inline-flex items-center px-2 py-1 rounded text-xs ${priorityLevel?.color || 'bg-gray-100 text-gray-800'} dark:bg-gray-900/20 dark:text-gray-300`}>
                              {priorityLevel?.label || priority}
                            </span>
                          )
                        }) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Channels:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.actions.channels.map(channel => {
                          const channelConfig = NOTIFICATION_CHANNELS.find(c => c.value === channel)
                          return (
                            <span key={channel} className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              {typeof channelConfig?.icon === 'string' ? channelConfig.icon : channelConfig?.icon}
                              <span>{channelConfig?.label || channel}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stats</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div>Last triggered: Never</div>
                    <div>Total triggers: 0</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingRule ? 'Edit' : 'Create'} Notification Rule
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cooldown (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={formData.cooldown}
                      onChange={(e) => setFormData({...formData, cooldown: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Describe when this rule should trigger"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rule is active
                    </span>
                  </label>
                </div>

                {/* Event Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Types * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {EVENT_TYPES.map(type => (
                      <label key={type.value} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.conditions.types.includes(type.value)}
                          onChange={() => handleArrayToggle(
                            formData.conditions.types,
                            type.value,
                            (types) => setFormData({...formData, conditions: {...formData.conditions, types}})
                          )}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{type.icon}</span>
                        <span className="text-sm text-gray-900 dark:text-white">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority Levels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority Levels (Leave empty for all)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PRIORITY_LEVELS.map(priority => (
                      <label key={priority.value} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.conditions.priorities.includes(priority.value)}
                          onChange={() => handleArrayToggle(
                            formData.conditions.priorities,
                            priority.value,
                            (priorities) => setFormData({...formData, conditions: {...formData.conditions, priorities}})
                          )}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${priority.color}`}>
                          {priority.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Channels * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {NOTIFICATION_CHANNELS.map(channel => (
                      <label key={channel.value} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.actions.channels.includes(channel.value)}
                          onChange={() => handleArrayToggle(
                            formData.actions.channels,
                            channel.value,
                            (channels) => setFormData({...formData, actions: {...formData.actions, channels}})
                          )}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {typeof channel.icon === 'string' ? channel.icon : channel.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{channel.label}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{channel.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Webhook/Slack Configuration */}
                {formData.actions.channels.includes('webhook') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={formData.actions.webhookUrl}
                      onChange={(e) => setFormData({...formData, actions: {...formData.actions, webhookUrl: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-webhook-url.com"
                    />
                  </div>
                )}

                {formData.actions.channels.includes('slack') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Slack Channel
                    </label>
                    <input
                      type="text"
                      value={formData.actions.slackChannel}
                      onChange={(e) => setFormData({...formData, actions: {...formData.actions, slackChannel: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="#alerts"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isPending ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}