'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'
import { trpc } from '@/lib/trpc'
import { 
  BellIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { 
  getArrayFromData, 
  getNotificationIcon, 
  getPriorityColor, 
  getTypeColor, 
  formatTimeAgo 
} from '@/shared'

type NotificationType = 'info' | 'success' | 'warning' | 'error'
type NotificationPriority = 'low' | 'medium' | 'high'

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
  category?: string
  actionUrl?: string
}

export default function NotificationCenter() {
  const { addToast } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all')
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // tRPC queries and mutations
  const { data: notifications, refetch: refetchNotifications } = trpc.notifications.getAll.useQuery()

  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications()
    }
  })

  const deleteNotificationMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetchNotifications()
    }
  })

  const sendTestNotificationMutation = trpc.notifications.sendTestNotification.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Test Notification Sent',
        message: 'A test notification has been sent successfully'
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

  const getNotificationsArray = () => getArrayFromData(notifications)

  const getFilteredNotifications = () => {
    const notificationsArray = getNotificationsArray()
    
    return notificationsArray.filter(notification => {
      // Type filter
      if (filterType !== 'all' && notification.type !== filterType) return false
      
      // Priority filter
      if (filterPriority !== 'all' && notification.priority !== filterPriority) return false
      
      // Read status filter
      if (filterRead === 'read' && !notification.isRead) return false
      if (filterRead === 'unread' && notification.isRead) return false
      
      // Search query
      if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      return true
    })
  }

  const getNotificationIconComponent = (type: NotificationType) => {
    const IconComponent = getNotificationIcon(type)
    return <IconComponent className="h-5 w-5 text-blue-500" />
  }

  const unreadCount = getNotificationsArray().filter(n => !n.isRead).length || 0
  const filteredNotifications = getFilteredNotifications()

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Link
                href="/notifications"
                className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View All
              </Link>
              <button
                onClick={() => sendTestNotificationMutation.mutate()}
                className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FunnelIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as NotificationPriority | 'all')}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Read Status Filter */}
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No notifications found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIconComponent(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Priority Badge */}
                          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>

                        {/* Meta Information */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            {notification.category && (
                              <span className="px-2 py-1 bg-gray-100 rounded-md">
                                {notification.category}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotificationMutation.mutate({ id: notification.id })}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Action URL */}
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <a
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              View Details →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredNotifications.length} of {notifications?.length || 0} notifications
              </span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{notifications?.filter(n => !n.isRead).length || 0} unread</span>
                </span>
                <button
                  onClick={() => {
                    // Mark all as read functionality
                    filteredNotifications.forEach(notification => {
                      if (!notification.isRead) {
                        markAsReadMutation.mutate({ id: notification.id })
                      }
                    })
                  }}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all read
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}