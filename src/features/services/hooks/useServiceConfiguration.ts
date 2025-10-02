'use client'

/**
 * Service Configuration Hook
 * Custom hook for managing advanced service configurations
 */

import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import { 
  Service, 
  ServiceConfiguration,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceFilters,
  ServiceTemplate,
  ServiceGroup,
  ServiceMetrics
} from '../types/service.types'

export function useServiceConfiguration() {
  const { addToast } = useNotifications()
  const utils = trpc.useContext()

  // Queries
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError
  } = trpc.services.getAll.useQuery()

  const {
    data: templates = [],
    isLoading: isLoadingTemplates
  } = trpc.services.getTemplates.useQuery()

  const {
    data: groups = [],
    isLoading: isLoadingGroups
  } = trpc.services.getGroups.useQuery()

  const {
    data: metrics = [],
    isLoading: isLoadingMetrics
  } = trpc.services.getMetrics.useQuery()

  // Mutations
  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Service created successfully'
      })
      utils.services.getAll.invalidate()
      utils.services.getMetrics.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to create service'
      })
    }
  })

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Service updated successfully'
      })
      utils.services.getAll.invalidate()
      utils.services.getMetrics.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to update service'
      })
    }
  })

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Service deleted successfully'
      })
      utils.services.getAll.invalidate()
      utils.services.getMetrics.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to delete service'
      })
    }
  })

  const createGroupMutation = trpc.services.createGroup.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        message: 'Service group created successfully'
      })
      utils.services.getGroups.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to create service group'
      })
    }
  })

  const bulkUpdateMutation = trpc.services.bulkUpdate.useMutation({
    onSuccess: (result) => {
      addToast({
        type: 'success',
        message: `Successfully updated ${result.updated} services`
      })
      utils.services.getAll.invalidate()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to bulk update services'
      })
    }
  })

  // Action handlers
  const createService = useCallback(async (data: CreateServiceInput) => {
    return createServiceMutation.mutateAsync(data)
  }, [createServiceMutation])

  const updateService = useCallback(async (data: UpdateServiceInput) => {
    return updateServiceMutation.mutateAsync(data)
  }, [updateServiceMutation])

  const deleteService = useCallback(async (id: string) => {
    return deleteServiceMutation.mutateAsync({ id })
  }, [deleteServiceMutation])

  const createGroup = useCallback(async (data: Omit<ServiceGroup, 'id'>) => {
    return createGroupMutation.mutateAsync(data)
  }, [createGroupMutation])

  const bulkUpdate = useCallback(async (serviceIds: string[], updates: Partial<UpdateServiceInput>) => {
    return bulkUpdateMutation.mutateAsync({ serviceIds, updates })
  }, [bulkUpdateMutation])

  // Utility functions
  const getServicesByCategory = useCallback((category: string) => {
    if (!Array.isArray(services)) return []
    return services.filter(service => service.category === category)
  }, [services])

  const getServicesByGroup = useCallback((groupId: string) => {
    if (!Array.isArray(groups) || !Array.isArray(services)) return []
    const group = groups.find(g => g.id === groupId)
    return group ? services.filter(s => group.services.includes(s.id)) : []
  }, [services, groups])

  const getServiceMetrics = useCallback((serviceId: string) => {
    return metrics.find(m => m.serviceId === serviceId)
  }, [metrics])

  const filterServices = useCallback((filters: ServiceFilters) => {
    if (!Array.isArray(services)) return []
    return services.filter(service => {
      // Apply category filter
      if (filters.category && service.category !== filters.category) return false
      
      // Apply status filter
      if (filters.status && service.status !== filters.status) return false
      
      // Apply active/inactive filter
      if (filters.isActive !== undefined && service.isActive !== filters.isActive) return false
      
      // Apply search filter - this should be combined with other filters, not replace them
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = (
          service.name.toLowerCase().includes(searchTerm) ||
          (service.description && service.description.toLowerCase().includes(searchTerm)) ||
          service.url.toLowerCase().includes(searchTerm)
        )
        if (!matchesSearch) return false
      }
      
      return true
    })
  }, [services])

  const getAvailableCategories = useCallback(() => {
    if (!Array.isArray(services)) return []
    return [...new Set(services.map(s => s.category))].sort()
  }, [services])

  return {
    // Data
    services,
    templates,
    groups,
    metrics,
    
    // Loading states
    isLoadingServices,
    isLoadingTemplates,
    isLoadingGroups,
    isLoadingMetrics,
    
    // Error states
    servicesError,
    
    // Mutation states
    isCreating: createServiceMutation.isLoading,
    isUpdating: updateServiceMutation.isLoading,
    isDeleting: deleteServiceMutation.isLoading,
    isBulkUpdating: bulkUpdateMutation.isLoading,
    
    // Actions
    createService,
    updateService,
    deleteService,
    createGroup,
    bulkUpdate,
    
    // Utilities
    getServicesByCategory,
    getServicesByGroup,
    getServiceMetrics,
    filterServices,
    getAvailableCategories,
  }
}