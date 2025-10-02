/**
 * NotificationItem Component
 * Individual notification display with actions
 */

import React from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ServerIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { type NotificationItemProps } from '../types/notification.types'

const typeIcons = {
  service_down: ExclamationCircleIcon,
  service_up: CheckCircleIcon,
  slow_response: ExclamationTriangleIcon,
  maintenance: CogIcon,
  security: ShieldCheckIcon,
  user_action: UserIcon,
  system: ServerIcon,
}

const typeColors = {
  service_down: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  service_up: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  slow_response: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  maintenance: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  security: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  user_action: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  system: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
}

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-yellow-400',
  critical: 'border-l-red-500'
}

interface ExtendedNotificationItemProps extends NotificationItemProps {
  isSelected?: boolean
  onSelect?: () => void
}

export function NotificationItem({
  notification,
  isSelected = false,
  onSelect,
  onRead,
  onDelete,
  onAction
}: ExtendedNotificationItemProps) {
  const Icon = typeIcons[notification.type]
  const typeColorClass = typeColors[notification.type]
  const priorityColorClass = priorityColors[notification.priority]
  
  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onRead(notification.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onDelete(notification.id)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onSelect?.()
  }

  const handleNotificationClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
    
    // Handle notification actions
    if (onAction) {
      onAction(notification, 'view')
    }
  }

  return (
    <div
      className={`relative px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-l-4 ${priorityColorClass} ${
        !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      } ${isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start space-x-4">
        {/* Selection Checkbox */}
        {onSelect && (
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-lg ${typeColorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-medium ${
                  notification.isRead 
                    ? 'text-gray-700 dark:text-gray-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {notification.title}
                </h4>
                
                {!notification.isRead && (
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  notification.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  notification.priority === 'high' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  notification.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {notification.priority}
                </span>
              </div>

              <p className={`mt-1 text-sm ${
                notification.isRead 
                  ? 'text-gray-500 dark:text-gray-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {notification.message}
              </p>

              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                
                {notification.serviceName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ServerIcon className="h-3 w-3" />
                      <span>{notification.serviceName}</span>
                    </span>
                  </>
                )}
                
                <span>•</span>
                <span className="capitalize">{notification.type.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-4">
              {!notification.isRead && (
                <button
                  onClick={handleMarkRead}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Mark as read"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              
              {notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Mark as unread would go here
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Mark as unread"
                >
                  <EyeSlashIcon className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete notification"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}