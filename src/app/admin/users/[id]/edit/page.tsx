'use client'

/**
 * Edit User Page
 * Form for editing existing users with role management and account controls
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { trpc } from '@/lib/trpc'
import { useUserManagement } from '@/features/user-management/hooks/useUserManagement'
import { UserForm } from '@/features/user-management/components/UserForm'
import { useNotifications } from '@/contexts/NotificationContext'
import { CreateUserInput, UpdateUserInput } from '@/features/user-management/types/user.types'

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const router = useRouter()
  const { addToast } = useNotifications()
  const { updateUser, isSubmitting } = useUserManagement()

  // Fetch user data
  const { 
    data: user, 
    isLoading: isLoadingUser,
    error: userError
  } = trpc.users.getById.useQuery(
    params.id,
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  const handleSubmit = async (userData: CreateUserInput | UpdateUserInput) => {
    if (!('id' in userData)) {
      throw new Error('Cannot create user in edit mode')
    }
    const result = await updateUser(userData)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: `User "${user?.username}" updated successfully`
      })
      router.push('/admin/users')
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to update user'
      })
    }
  }

  const handleCancel = () => {
    router.push('/admin/users')
  }

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Users
            </Link>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mt-2 animate-pulse"></div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-2 animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Not Found
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                User not found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                The user you're looking for doesn't exist or you don't have permission to access it.
              </p>
              <Link
                href="/admin/users"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User not found
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/admin/users"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Not Found
            </h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit User: {user.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update user information, role, and account settings
          </p>
        </div>

        {/* User Form */}
        <UserForm
          user={user}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}