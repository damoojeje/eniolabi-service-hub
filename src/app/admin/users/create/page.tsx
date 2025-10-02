'use client'

/**
 * Create User Page
 * Form for creating new users with role assignment
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useUserManagement } from '@/features/user-management/hooks/useUserManagement'
import { UserForm } from '@/features/user-management/components/UserForm'
import { useNotifications } from '@/contexts/NotificationContext'
import { CreateUserInput, UpdateUserInput } from '@/features/user-management/types/user.types'

export default function CreateUserPage() {
  const router = useRouter()
  const { addToast } = useNotifications()
  const { createUser, isSubmitting } = useUserManagement()

  const handleSubmit = async (userData: CreateUserInput | UpdateUserInput) => {
    if ('id' in userData) {
      throw new Error('Cannot update user in create mode')
    }
    const result = await createUser(userData)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: `User "${userData.username}" created successfully`
      })
      router.push('/admin/users')
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to create user'
      })
    }
  }

  const handleCancel = () => {
    router.push('/admin/users')
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
            Create New User
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add a new user to the system with appropriate permissions and role
          </p>
        </div>

        {/* User Form */}
        <UserForm
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}