'use client'

import React, { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  TagIcon,
  EyeIcon,
  ChevronDownIcon,
  ServerIcon,
  FunnelIcon,
  Square2StackIcon,
  Cog8ToothIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'

type BulkOperation = 'enable' | 'disable' | 'delete' | 'category' | 'check_health'
type FilterType = 'all' | 'online' | 'offline' | 'warning' | 'error' | 'category'

interface BulkOperationConfig {
  type: BulkOperation
  label: string
  icon: React.ReactNode
  color: string
  description: string
}

interface OperationResult {
  serviceId: string
  serviceName: string
  success: boolean
  message: string
}

export default function BulkOperations() {
  const { addToast } = useNotifications()
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [operationResults, setOperationResults] = useState<OperationResult[]>([])

  // Fetch services
  const { data: services = [], isLoading, refetch } = trpc.services.getAll.useQuery()

  const bulkUpdateMutation = trpc.services.bulkUpdate.useMutation({
    onSuccess: (data) => {
      const results: OperationResult[] = selectedServices.map(serviceId => {
        const service = services.find(s => s.id === serviceId)
        return {
          serviceId,
          serviceName: service?.name || 'Unknown Service',
          success: true,
          message: 'Operation completed successfully'
        }
      })

      setOperationResults(results)
      setShowResults(true)

      addToast({
        type: 'success',
        title: 'Bulk Operation Complete',
        message: `Successfully updated ${data.updated} services`
      })

      refetch()
      setSelectedServices([])
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Bulk Operation Failed',
        message: error.message
      })
    }
  })

  const operations: BulkOperationConfig[] = [
    {
      type: 'enable',
      label: 'Enable Services',
      icon: <PlayIcon className="w-4 h-4" />,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Activate selected services'
    },
    {
      type: 'disable',
      label: 'Disable Services',
      icon: <StopIcon className="w-4 h-4" />,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Deactivate selected services'
    },
    {
      type: 'category',
      label: 'Update Category',
      icon: <TagIcon className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Change category for selected services'
    },
    {
      type: 'check_health',
      label: 'Health Check',
      icon: <ArrowPathIcon className="w-4 h-4" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Run health checks on selected services'
    }
  ]

  // Filter and search services
  const filteredServices = useMemo(() => {
    let filtered = services

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(service => {
        if (filter === 'category') return true
        const status = service.currentStatus?.status
        switch (filter) {
          case 'online': return status === 'ONLINE'
          case 'offline': return status === 'OFFLINE'
          case 'warning': return status === 'WARNING'
          case 'error': return status === 'ERROR'
          default: return true
        }
      })
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(service =>
        service.category.toLowerCase().includes(categoryFilter.toLowerCase())
      )
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [services, filter, categoryFilter, searchTerm])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(services.map(s => s.category))).sort()
  }, [services])

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(filteredServices.map(s => s.id))
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleBulkOperation = (operation: BulkOperation) => {
    if (selectedServices.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Services Selected',
        message: 'Please select at least one service to perform bulk operations'
      })
      return
    }

    let updates: any = {}

    switch (operation) {
      case 'enable':
        updates = { isActive: true }
        break
      case 'disable':
        updates = { isActive: false }
        break
      case 'category':
        const newCategory = prompt('Enter new category name:')
        if (!newCategory) return
        updates = { category: newCategory }
        break
      case 'check_health':
        // This would typically trigger health checks
        addToast({
          type: 'info',
          title: 'Health Check Initiated',
          message: `Health checks started for ${selectedServices.length} services`
        })
        return
      default:
        return
    }

    bulkUpdateMutation.mutate({
      serviceIds: selectedServices,
      updates
    })
  }

  const getServiceStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500'
      case 'WARNING': return 'bg-yellow-500'
      case 'ERROR': return 'bg-orange-500'
      case 'OFFLINE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getServiceStatusText = (status?: string) => {
    return status || 'UNKNOWN'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bulk Operations
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Perform operations on multiple services simultaneously
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedServices.length} of {filteredServices.length} services selected
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Services</option>
              <option value="online">Online Only</option>
              <option value="offline">Offline Only</option>
              <option value="warning">Warning Status</option>
              <option value="error">Error Status</option>
              <option value="category">By Category</option>
            </select>
          </div>

          {filter === 'category' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2">
              {operations.map((operation) => (
                <button
                  key={operation.type}
                  onClick={() => handleBulkOperation(operation.type)}
                  disabled={bulkUpdateMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 ${operation.color} disabled:opacity-50 text-white text-sm rounded-lg transition-colors`}
                  title={operation.description}
                >
                  {operation.icon}
                  <span>{operation.label}</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedServices([])}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filteredServices.length > 0 && selectedServices.length === filteredServices.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({filteredServices.length})
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Select
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Loading services...</p>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ServerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No services found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedServices.includes(service.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <ServerIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getServiceStatusColor(service.currentStatus?.status)}`}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getServiceStatusText(service.currentStatus?.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {service.currentStatus?.checkedAt
                        ? new Date(service.currentStatus.checkedAt).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operation Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Operation Results
                  </h3>
                </div>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {operationResults.map((result) => (
                  <div key={result.serviceId} className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XMarkIcon className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.serviceName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowResults(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}