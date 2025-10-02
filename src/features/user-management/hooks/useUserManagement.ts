'use client'

/**
 * User Management Hook
 * Custom hook for managing users with tRPC integration
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { CreateUserInput, UpdateUserInput } from '../types/user.types'
import { Role } from '@prisma/client'

export function useUserManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = trpc.useUtils()

  // Queries
  const {
    data: users,
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = trpc.users.getAll.useQuery()

  const {
    data: userStats,
    isLoading: isLoadingStats
  } = trpc.users.getStats.useQuery()

  // Mutations
  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate()
      utils.users.getStats.invalidate()
    }
  })

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate()
      utils.users.getStats.invalidate()
    }
  })

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate()
      utils.users.getStats.invalidate()
    }
  })

  const resetPasswordMutation = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate()
    }
  })

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate()
      utils.users.getStats.invalidate()
    }
  })

  // Helper functions
  const createUser = async (userData: CreateUserInput) => {
    setIsSubmitting(true)
    try {
      await createUserMutation.mutateAsync(userData)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create user'
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateUser = async (userData: UpdateUserInput) => {
    setIsSubmitting(true)
    try {
      await updateUserMutation.mutateAsync(userData)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update user'
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete user'
      }
    }
  }

  const resetUserPassword = async (userId: string, newPassword: string, mustChangePassword = true) => {
    try {
      await resetPasswordMutation.mutateAsync({ 
        id: userId, 
        newPassword, 
        mustChangePassword 
      })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password'
      }
    }
  }

  const updateUserRole = async (userId: string, role: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update role'
      }
    }
  }

  return {
    // Data
    users: users || [],
    userStats,
    
    // Loading states
    isLoadingUsers,
    isLoadingStats,
    isSubmitting,
    isDeleting: deleteUserMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,

    // Actions
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    updateUserRole,
    refetchUsers
  }
}