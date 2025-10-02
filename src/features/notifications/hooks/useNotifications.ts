/**
 * Notifications Management Hook
 * Comprehensive notification handling with tRPC integration
 */

import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import { 
  type NotificationFilters, 
  type BulkNotificationAction,
  type NotificationRule 
} from '../types/notification.types'

interface UseNotificationsParams {
  initialFilters?: NotificationFilters
  limit?: number
}

export function useNotifications(params: UseNotificationsParams = {}) {
  const { initialFilters = {}, limit = 20 } = params
  
  const [filters, setFilters] = useState<NotificationFilters>(initialFilters)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const utils = trpc.useUtils()

  // Queries
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = trpc.notifications.getAll.useQuery()

  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = trpc.notifications.getStats.useQuery()

  const {
    data: preferences,
    isLoading: isLoadingPreferences
  } = trpc.notifications.getPreferences.useQuery()

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
    }
  })

  const deleteMutation = trpc.notifications.delete.useMutation({
    onMutate: (variables) => {
      console.log('🔄 [DEBUG] Delete mutation starting with variables:', variables)
    },
    onSuccess: (data, variables) => {
      console.log('✅ [DEBUG] Delete mutation onSuccess:', { data, variables })
      console.log('✅ [DEBUG] Invalidating queries...')
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
    },
    onError: (error, variables) => {
      console.error('❌ [DEBUG] Delete mutation onError:', { error, variables })
      console.error('❌ [DEBUG] Error details:', {
        message: error.message,
        data: error.data,
        shape: error.shape
      })
    },
    onSettled: (data, error, variables) => {
      console.log('🏁 [DEBUG] Delete mutation onSettled:', { data, error, variables })
    }
  })

  const bulkActionMutation = trpc.notifications.bulkAction.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
      setSelectedIds([])
    }
  })

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
    }
  })

  const deleteAllReadMutation = trpc.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
    }
  })

  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      utils.notifications.getPreferences.invalidate()
    }
  })

  // Actions
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync({ id })
      return { success: true }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as read'
      }
    }
  }, [markAsReadMutation])

  const deleteNotification = useCallback(async (id: string) => {
    console.log('🗑️ [DEBUG] deleteNotification called with ID:', id)
    console.log('🗑️ [DEBUG] deleteMutation state:', {
      isPending: deleteMutation.isPending,
      isError: deleteMutation.isError,
      error: deleteMutation.error
    })

    try {
      console.log('🗑️ [DEBUG] Calling deleteMutation.mutateAsync...')
      // Pass as object with id property - server expects input.id
      const result = await deleteMutation.mutateAsync({ id })
      console.log('🗑️ [DEBUG] Delete mutation successful:', result)
      console.log('🗑️ [DEBUG] Current notifications before invalidation:', notifications?.length || 0)
      return { success: true }
    } catch (error) {
      console.error('🗑️ [DEBUG] Delete mutation failed:', error)
      console.error('🗑️ [DEBUG] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? error.cause : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete notification'
      }
    }
  }, [deleteMutation, notifications])

  const bulkAction = useCallback(async (action: BulkNotificationAction) => {
    try {
      const result = await bulkActionMutation.mutateAsync(action)
      return { success: true, affected: result.affected }
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform bulk action' 
      }
    }
  }, [bulkActionMutation])

  const markAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsReadMutation.mutateAsync()
      return { success: true, affected: result.affected }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mark all as read' 
      }
    }
  }, [markAllAsReadMutation])

  const deleteAllRead = useCallback(async () => {
    try {
      const result = await deleteAllReadMutation.mutateAsync()
      return { success: true, affected: result.affected }
    } catch (error) {
      console.error('Failed to delete all read:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete all read notifications' 
      }
    }
  }, [deleteAllReadMutation])

  const updatePreferences = useCallback(async (newPreferences: Partial<typeof preferences>) => {
    try {
      await updatePreferencesMutation.mutateAsync(newPreferences)
      return { success: true }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update preferences' 
      }
    }
  }, [updatePreferencesMutation])

  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }, [])

  const selectAll = useCallback(() => {
    const notificationIds = notifications?.map(n => n.id) || []
    setSelectedIds(notificationIds)
  }, [notifications])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  return {
    // Data
    notifications: notifications || [],
    total: notifications?.length || 0,
    hasMore: false,
    stats: stats || {
      total: 0,
      unread: 0,
      critical: 0,
      byType: {},
      byPriority: {},
      todayCount: 0,
      weekCount: 0
    },
    preferences,
    
    // State
    filters,
    selectedIds,
    
    // Loading states
    isLoadingNotifications,
    isLoadingStats,
    isLoadingPreferences,
    isSubmitting: markAsReadMutation.isPending ||
                  deleteMutation.isPending ||
                  bulkActionMutation.isPending ||
                  markAllAsReadMutation.isPending ||
                  deleteAllReadMutation.isPending ||
                  updatePreferencesMutation.isPending,

    // Error states
    error: notificationsError,
    
    // Actions
    markAsRead,
    deleteNotification,
    bulkAction,
    markAllAsRead,
    deleteAllRead,
    updatePreferences,
    updateFilters,
    clearFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    refetchNotifications,
    refetchStats
  }
}

// Hook for notification rules (admin only)
export function useNotificationRules() {
  const utils = trpc.useUtils()

  // Queries
  const {
    data: rules,
    isLoading: isLoadingRules,
    error: rulesError
  } = trpc.notifications.getRules.useQuery()

  // Mutations
  const createRuleMutation = trpc.notifications.createRule.useMutation({
    onSuccess: () => {
      utils.notifications.getRules.invalidate()
    }
  })

  const updateRuleMutation = trpc.notifications.updateRule.useMutation({
    onSuccess: () => {
      utils.notifications.getRules.invalidate()
    }
  })

  const deleteRuleMutation = trpc.notifications.deleteRule.useMutation({
    onSuccess: () => {
      utils.notifications.getRules.invalidate()
    }
  })

  const testRuleMutation = trpc.notifications.testRule.useMutation({
    onSuccess: () => {
      utils.notifications.getAll.invalidate()
      utils.notifications.getStats.invalidate()
    }
  })

  // Actions
  const createRule = useCallback(async (ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createRuleMutation.mutateAsync(ruleData)
      return { success: true }
    } catch (error) {
      console.error('Failed to create rule:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create rule' 
      }
    }
  }, [createRuleMutation])

  const updateRule = useCallback(async (ruleData: NotificationRule) => {
    try {
      await updateRuleMutation.mutateAsync(ruleData)
      return { success: true }
    } catch (error) {
      console.error('Failed to update rule:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update rule' 
      }
    }
  }, [updateRuleMutation])

  const deleteRule = useCallback(async (id: string) => {
    try {
      await deleteRuleMutation.mutateAsync({ id })
      return { success: true }
    } catch (error) {
      console.error('Failed to delete rule:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete rule' 
      }
    }
  }, [deleteRuleMutation])

  const testRule = useCallback(async (id: string) => {
    try {
      const result = await testRuleMutation.mutateAsync({ id })
      return { success: true, notification: result.notification }
    } catch (error) {
      console.error('Failed to test rule:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test rule' 
      }
    }
  }, [testRuleMutation])

  return {
    // Data
    rules: rules || [],
    
    // Loading states
    isLoadingRules,
    isSubmitting: createRuleMutation.isPending ||
                  updateRuleMutation.isPending ||
                  deleteRuleMutation.isPending ||
                  testRuleMutation.isPending,

    // Error states
    error: rulesError,
    
    // Actions
    createRule,
    updateRule,
    deleteRule,
    testRule
  }
}