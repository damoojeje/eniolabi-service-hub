'use client'

/**
 * User Analytics Dashboard Page
 * Advanced user management interface with analytics, bulk operations, and data export
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  UsersIcon, 
  ChartBarIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

interface UserStatsCard {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ComponentType<any>
}

function UserStatsCard({ title, value, subtitle, trend, icon: Icon }: UserStatsCard) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    stable: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-gray-500 dark:text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  )
}

function BulkOperationsPanel({ selectedUsers, onClearSelection }: { 
  selectedUsers: string[]
  onClearSelection: () => void 
}) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const bulkDeleteMutation = trpc.users.bulkDeleteUsers.useMutation({
    onSuccess: () => {
      onClearSelection()
      setShowConfirmation(false)
    }
  })

  const handleBulkDelete = () => {
    if (selectedUsers.length > 0) {
      bulkDeleteMutation.mutate({ userIds: selectedUsers })
    }
  }

  if (selectedUsers.length === 0) {
    return null
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {selectedUsers.length} user(s) selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Selection
          </button>
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={bulkDeleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      </div>

      {showConfirmation && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            Are you sure you want to delete {selectedUsers.length} user(s)? This action cannot be undone.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 rounded text-sm font-medium"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserTable({ users, selectedUsers, onUserToggle }: {
  users: any[]
  selectedUsers: string[]
  onUserToggle: (userId: string) => void
}) {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No users found</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      users.forEach(user => {
                        if (!selectedUsers.includes(user.id)) {
                          onUserToggle(user.id)
                        }
                      })
                    } else {
                      users.forEach(user => {
                        if (selectedUsers.includes(user.id)) {
                          onUserToggle(user.id)
                        }
                      })
                    }
                  }}
                  checked={users.length > 0 && users.every(user => selectedUsers.includes(user.id))}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Last Login
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onUserToggle(user.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {(user.name || user.email)?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'No Name'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    user.role === 'POWER_USER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {user.role || 'USER'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function UserAnalyticsPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  // Fetch user analytics data
  const { data: userStats, isLoading: loadingStats } = trpc.users.getStats.useQuery()
  const { data: allUsers, isLoading: loadingUsers, refetch: refetchUsers } = trpc.users.getAll.useQuery()

  // Export users mutation
  const exportUsersMutation = trpc.users.exportUsers.useMutation({
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data.content], { type: data.mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  })

  const isLoading = loadingStats || loadingUsers

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleExport = () => {
    exportUsersMutation.mutate({ format: exportFormat })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Users
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
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
              href="/admin/users"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Users
            </Link>
            <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Analytics</h1>
          </div>
          
          {/* Export Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportUsersMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {exportUsersMutation.isPending ? 'Exporting...' : 'Export Users'}
            </button>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <UserStatsCard
            title="Total Users"
            value={userStats?.total || 0}
            subtitle="All registered users"
            icon={UsersIcon}
          />
          <UserStatsCard
            title="Active Users"
            value={userStats?.status.active || 0}
            subtitle={`${userStats?.total ? Math.round((userStats.status.active / userStats.total) * 100) : 0}% of total`}
            trend="up"
            icon={UserGroupIcon}
          />
          <UserStatsCard
            title="New This Month"
            value={userStats?.recentLogins || 0}
            subtitle="Recently registered"
            icon={CalendarDaysIcon}
          />
          <UserStatsCard
            title="Admin Users"
            value={userStats?.roles.admins || 0}
            subtitle="Administrative access"
            icon={ChartBarIcon}
          />
        </div>

        {/* Bulk Operations Panel */}
        <BulkOperationsPanel
          selectedUsers={selectedUsers}
          onClearSelection={() => setSelectedUsers([])}
        />

        {/* User Table */}
        <UserTable
          users={allUsers || []}
          selectedUsers={selectedUsers}
          onUserToggle={handleUserToggle}
        />
      </div>
    </div>
  )
}