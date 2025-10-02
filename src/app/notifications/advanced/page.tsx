'use client'

/**
 * Advanced Notification Management Page
 * Comprehensive interface for bulk operations, analytics, and notification management
 */

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  BellIcon, 
  ChartBarIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface NotificationStatsCard {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ComponentType<any>
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

function NotificationStatsCard({ title, value, subtitle, trend, icon: Icon, color = 'blue' }: NotificationStatsCard) {
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: 'text-red-600 dark:text-red-400'
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: 'text-gray-600 dark:text-gray-400'
    }
  }

  const config = colorConfig[color]

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.text} opacity-80 mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${config.text}`}>{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${config.text} opacity-60`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className={`h-8 w-8 ${config.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}

function BulkActionsPanel({ onMarkAllAsRead, onDeleteOld }: {
  onMarkAllAsRead: () => void
  onDeleteOld: () => void
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteOlderThan, setDeleteOlderThan] = useState<number>(30)

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      // Refresh notifications
      onMarkAllAsRead()
    }
  })

  const deleteOldMutation = trpc.notifications.deleteOldNotifications.useMutation({
    onSuccess: () => {
      setShowDeleteConfirm(false)
      onDeleteOld()
    }
  })

  const handleDeleteOld = () => {
    deleteOldMutation.mutate()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bulk Operations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mark All as Read */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark All as Read</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mark all unread notifications as read for all users
          </p>
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {markAllAsReadMutation.isPending ? 'Processing...' : 'Mark All Read'}
          </button>
        </div>

        {/* Delete Old Notifications */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete Old Notifications</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remove notifications older than specified days
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="365"
              value={deleteOlderThan}
              onChange={(e) => setDeleteOlderThan(Number(e.target.value))}
              className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Confirm Deletion</h4>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            This will permanently delete all notifications older than {deleteOlderThan} days. This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteOld}
              disabled={deleteOldMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {deleteOldMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationTypeChart({ stats }: { stats: any }) {
  if (!stats || !stats.byType) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications by Type</h3>
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  const typeColors = {
    info: { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
    success: { bg: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
    warning: { bg: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300' },
    error: { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
    system: { bg: 'bg-gray-500', text: 'text-gray-700 dark:text-gray-300' }
  }

  const total = Object.values(stats.byType).reduce((sum: number, count: any) => sum + count, 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications by Type</h3>
      <div className="space-y-4">
        {Object.entries(stats.byType).map(([type, count]) => {
          const percentage = total > 0 ? Math.round(((count as number) / total) * 100) : 0
          const config = typeColors[type as keyof typeof typeColors] || typeColors.info
          
          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                <span className={`text-sm font-medium capitalize ${config.text}`}>
                  {type}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${config.bg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {count as number}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 w-10 text-right">
                  ({percentage as number}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentActivity({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
      </div>
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckIcon
      case 'warning': return ExclamationTriangleIcon
      case 'error': return XMarkIcon
      case 'info': return InformationCircleIcon
      default: return BellIcon
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {activities.slice(0, 20).map((activity: any, index: number) => {
          const Icon = getNotificationIcon(activity.type)
          const iconColor = getNotificationColor(activity.type)
          
          return (
            <div key={activity.id || index} className="px-6 py-4 flex items-start space-x-3">
              <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2 ml-2">
                    {activity.read ? (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activity.message}
                </p>
                {activity.recipient && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    To: {activity.recipient}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdvancedNotificationsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch notification data
  const { data: notificationStats, isLoading: loadingStats, refetch: refetchStats } = trpc.notifications.getStats.useQuery()
  const { data: recentNotifications, isLoading: loadingRecent, refetch: refetchRecent } = trpc.notifications.getNotifications.useQuery(
    { limit: 50 },
    { enabled: true }
  )

  const isLoading = loadingStats || loadingRecent

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats()
      refetchRecent()
    }, 30000)

    return () => clearInterval(interval)
  }, [refetchStats, refetchRecent])

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    refetchStats()
    refetchRecent()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link
              href="/notifications"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Notifications
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/notifications"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Notifications
            </Link>
            <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Notifications</h1>
          </div>
          
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <NotificationStatsCard
            title="Total Notifications"
            value={notificationStats?.total || 0}
            subtitle="All time"
            icon={BellIcon}
            color="blue"
          />
          <NotificationStatsCard
            title="Unread"
            value={notificationStats?.unread || 0}
            subtitle={`${notificationStats?.total ? Math.round((notificationStats.unread / notificationStats.total) * 100) : 0}% pending`}
            icon={EyeSlashIcon}
            color="yellow"
          />
          <NotificationStatsCard
            title="This Week"
            value={notificationStats?.weekCount || 0}
            subtitle="Recent activity"
            icon={ClockIcon}
            color="green"
          />
          <NotificationStatsCard
            title="Success Rate"
            value={`${notificationStats ? Math.round((notificationStats.total - notificationStats.critical) / notificationStats.total * 100) : 0}%`}
            subtitle="Delivery success"
            icon={ChartBarIcon}
            color="green"
          />
        </div>

        {/* Bulk Operations */}
        <BulkActionsPanel
          onMarkAllAsRead={handleRefresh}
          onDeleteOld={handleRefresh}
        />

        {/* Analytics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NotificationTypeChart stats={notificationStats} />
          <RecentActivity activities={recentNotifications?.notifications || []} />
        </div>
      </div>
    </div>
  )
}