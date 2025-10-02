/**
 * NotificationCenter Component
 * Dropdown notification center with real-time updates
 */

import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationItem } from './NotificationItem'
import { NotificationFilters } from './NotificationFilters'
import { type NotificationCenterProps } from '../types/notification.types'

export function NotificationCenter({ isOpen, onClose, maxHeight = 600 }: NotificationCenterProps) {
  const {
    notifications,
    stats,
    selectedIds,
    isLoadingNotifications,
    markAsRead,
    deleteNotification,
    bulkAction,
    markAllAsRead,
    deleteAllRead,
    toggleSelection,
    selectAll,
    clearSelection,
    filters,
    updateFilters,
    clearFilters
  } = useNotifications()

  const [showFilters, setShowFilters] = React.useState(false)

  const handleBulkMarkRead = async () => {
    if (selectedIds.length > 0) {
      await bulkAction({
        action: 'mark_read',
        notificationIds: selectedIds
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await bulkAction({
        action: 'delete',
        notificationIds: selectedIds
      })
    }
  }

  const hasSelection = selectedIds.length > 0
  const allSelected = notifications.length > 0 && selectedIds.length === notifications.length

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel 
                className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-2xl"
                style={{ maxHeight }}
              >
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BellIconSolid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Notifications
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.unread} unread of {stats.total} total
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          showFilters ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' : ''
                        }`}
                        title="Filter notifications"
                      >
                        <FunnelIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {notifications.length > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => allSelected ? clearSelection() : selectAll()}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            Select all
                          </span>
                        </label>
                        
                        {hasSelection && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedIds.length} selected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {hasSelection && (
                          <>
                            <button
                              onClick={handleBulkMarkRead}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Mark Read
                            </button>
                            <button
                              onClick={handleBulkDelete}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </>
                        )}
                        
                        {stats.unread > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Mark all read
                          </button>
                        )}
                        
                        {stats.total > stats.unread && (
                          <button
                            onClick={deleteAllRead}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Clear read
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <NotificationFilters
                        filters={filters}
                        onFiltersChange={updateFilters}
                        stats={stats}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800" style={{ maxHeight: maxHeight - 200, overflowY: 'auto' }}>
                  {isLoadingNotifications ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <BellIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                        No notifications
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        You're all caught up! Check back later for new notifications.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification as any}
                          isSelected={selectedIds.includes(notification.id)}
                          onSelect={() => toggleSelection(notification.id)}
                          onRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats Footer */}
                {notifications.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Today: {stats.todayCount}</span>
                        <span>This week: {stats.weekCount}</span>
                        <span>Critical: {stats.byPriority.critical || 0}</span>
                      </div>
                      
                      <button
                        onClick={clearFilters}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}