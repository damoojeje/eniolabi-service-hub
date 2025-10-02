'use client'

/**
 * Users Management Page
 * Admin interface for managing users with table, stats, and actions
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useUserManagement } from '@/features/user-management/hooks/useUserManagement'
import { UserTable } from '@/features/user-management/components/UserTable'
import { UserStats } from '@/features/user-management/components/UserStats'
import { useNotifications } from '@/contexts/NotificationContext'

export default function UsersPage() {
  const router = useRouter()
  const { addToast } = useNotifications()
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<string | null>(null)
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    mustChangePassword: true
  })

  const {
    users,
    userStats,
    isLoadingUsers,
    isLoadingStats,
    isDeleting,
    isResettingPassword,
    deleteUser,
    resetUserPassword,
    refetchUsers
  } = useUserManagement()

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    const result = await deleteUser(userToDelete)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully'
      })
      setUserToDelete(null)
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to delete user'
      })
    }
  }

  const handleResetPasswordConfirm = async () => {
    if (!userToResetPassword) return

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match'
      })
      return
    }

    if (resetPasswordForm.newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Password must be at least 6 characters'
      })
      return
    }

    const result = await resetUserPassword(
      userToResetPassword, 
      resetPasswordForm.newPassword,
      resetPasswordForm.mustChangePassword
    )
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Password reset successfully'
      })
      setUserToResetPassword(null)
      setResetPasswordForm({
        newPassword: '',
        confirmPassword: '',
        mustChangePassword: true
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to reset password'
      })
    }
  }

  const getUserToDelete = () => {
    return users.find(u => u.id === userToDelete)
  }

  const getUserToResetPassword = () => {
    return users.find(u => u.id === userToResetPassword)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Admin
              </Link>
            </div>
            <Link
              href="/admin/users/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Add User
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage user accounts, roles, and permissions
            </p>
          </div>
        </div>

        {/* User Statistics */}
        <UserStats 
          stats={userStats} 
          isLoading={isLoadingStats} 
          className="mb-8"
        />

        {/* Users Table */}
        <UserTable
          users={users}
          isLoading={isLoadingUsers}
          onEdit={handleEdit}
          onDelete={(userId) => setUserToDelete(userId)}
          onResetPassword={(userId) => setUserToResetPassword(userId)}
        />

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete User
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete user "{getUserToDelete()?.username}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isDeleting}
                >
                  {isDeleting && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {userToResetPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Set a new password for "{getUserToResetPassword()?.username}"
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mustChangePassword"
                    checked={resetPasswordForm.mustChangePassword}
                    onChange={(e) => setResetPasswordForm(prev => ({
                      ...prev,
                      mustChangePassword: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="mustChangePassword" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    User must change password on next login
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setUserToResetPassword(null)
                    setResetPasswordForm({
                      newPassword: '',
                      confirmPassword: '',
                      mustChangePassword: true
                    })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  disabled={isResettingPassword}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPasswordConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Reset Password</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}