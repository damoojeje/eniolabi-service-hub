'use client'

/**
 * Admin Notifications Management Page
 * Comprehensive notification management with rules and analytics
 */

import React, { useState } from 'react'
import { 
  BellIcon,
  CogIcon,
  ChartBarIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { useNotifications, useNotificationRules } from '@/features/notifications/hooks/useNotifications'
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter'
import { NotificationSettings } from '@/features/notifications/components/NotificationSettings'
import { trpc } from '@/lib/trpc'
import { useNotifications as useNotificationsContext } from '@/contexts/NotificationContext'

type TabType = 'overview' | 'notifications' | 'rules' | 'settings' | 'analytics'

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)

  const { addToast } = useNotificationsContext()
  
  const {
    notifications,
    stats,
    preferences,
    updatePreferences,
    isLoadingNotifications,
    isLoadingStats
  } = useNotifications({ limit: 50 })

  const {
    rules,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    isLoadingRules,
    isSubmitting: isSubmittingRules
  } = useNotificationRules()

  // Create notification mutation (admin only)
  const createNotificationMutation = trpc.notifications.create.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification created successfully'
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: `Failed to create notification: ${error.message}`
      })
    }
  })

  const handleCreateRule = async (ruleData: any) => {
    const result = await createRule(ruleData)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification rule created successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to create rule'
      })
    }
  }

  const handleUpdateRule = async (ruleData: any) => {
    const result = await updateRule(ruleData)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification rule updated successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to update rule'
      })
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    const result = await deleteRule(ruleId)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification rule deleted successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to delete rule'
      })
    }
  }

  const handleTestRule = async (ruleId: string) => {
    const result = await testRule(ruleId)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Test notification sent successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to send test notification'
      })
    }
  }

  const handleUpdatePreferences = async (newPreferences: any) => {
    const result = await updatePreferences(newPreferences)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Notification preferences updated successfully'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to update preferences'
      })
    }
  }

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: ChartBarIcon },
    { id: 'notifications' as const, name: 'Notifications', icon: BellIcon },
    { id: 'rules' as const, name: 'Rules', icon: CogIcon },
    { id: 'settings' as const, name: 'Settings', icon: AdjustmentsHorizontalIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Configure notification settings, rules, and delivery channels
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotificationCenter(true)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BellIcon className="h-5 w-5 mr-2" />
                View Notifications
                {stats.unread > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {stats.unread}
                  </span>
                )}
              </button>

              <button
                onClick={() => {/* TODO: Create notification modal */}}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Notification
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BellIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isLoadingStats ? '-' : stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isLoadingStats ? '-' : stats.unread}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isLoadingStats ? '-' : (stats.byPriority?.critical || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isLoadingRules ? '-' : rules.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <NotificationOverview 
              stats={stats}
              isLoading={isLoadingStats}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationManagement 
              notifications={notifications}
              isLoading={isLoadingNotifications}
            />
          )}

          {activeTab === 'rules' && (
            <NotificationRulesManagement
              rules={rules}
              isLoading={isLoadingRules}
              isSubmitting={isSubmittingRules}
              onCreate={handleCreateRule}
              onUpdate={handleUpdateRule}
              onDelete={handleDeleteRule}
              onTest={handleTestRule}
            />
          )}

          {activeTab === 'settings' && preferences && (
            <NotificationSettings
              preferences={preferences as any}
              rules={rules as any}
              templates={[]}
              onUpdatePreferences={handleUpdatePreferences}
              onCreateRule={handleCreateRule}
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              onTestRule={handleTestRule}
            />
          )}
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        maxHeight={600}
      />
    </div>
  )
}

function NotificationOverview({ stats, isLoading }: { stats: any, isLoading: boolean }) {
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
          Notification Analytics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type Distribution */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              By Type
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.byType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              By Priority
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.byPriority || {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className={`text-sm font-medium capitalize ${
                    priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                    priority === 'high' ? 'text-yellow-600 dark:text-yellow-400' :
                    priority === 'medium' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {priority}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.todayCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Today</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.weekCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">This Week</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round((stats.unread / stats.total) * 100) || 0}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unread Rate</div>
        </div>
      </div>
    </div>
  )
}

function NotificationManagement({ notifications, isLoading }: { notifications: any[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Notifications
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {notifications.length} notifications
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Notifications will appear here when they are created.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 10).map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    notification.priority === 'critical' ? 'bg-red-500' :
                    notification.priority === 'high' ? 'bg-yellow-500' :
                    notification.priority === 'medium' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}></div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {notification.message}
                </p>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRulesManagement({ 
  rules, 
  isLoading, 
  isSubmitting, 
  onCreate, 
  onUpdate, 
  onDelete, 
  onTest 
}: {
  rules: any[]
  isLoading: boolean
  isSubmitting: boolean
  onCreate: (rule: any) => void
  onUpdate: (rule: any) => void
  onDelete: (id: string) => void
  onTest: (id: string) => void
}) {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Notification Rules
        </h2>
        <button
          onClick={() => {/* TODO: Create rule modal */}}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No notification rules
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create automated rules to manage notification delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {rule.description || 'No description'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    rule.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div>
                  <span className="font-medium">Types:</span> {rule.conditions.types.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Priorities:</span> {rule.conditions.priorities.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Channels:</span> {rule.actions.channels.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Cooldown:</span> {rule.cooldown}m
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTest(rule.id)}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900 disabled:opacity-50"
                >
                  Test
                </button>
                
                <button
                  onClick={() => {/* TODO: Edit rule modal */}}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => onDelete(rule.id)}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}