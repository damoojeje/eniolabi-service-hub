'use client'

/**
 * Advanced Services Configuration Page
 * Comprehensive service management with advanced configuration options
 */

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  PlusIcon,
  CogIcon,
  ServerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { ServiceConfigurator } from '@/features/services/components/ServiceConfigurator'
import { useServiceConfiguration } from '@/features/services/hooks/useServiceConfiguration'
import { useNotifications } from '@/contexts/NotificationContext'
import { Service, ServiceFilters, CreateServiceInput, UpdateServiceInput } from '@/features/services/types/service.types'
import Link from 'next/link'

export default function AdvancedServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useNotifications()
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<ServiceFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showConfigurator, setShowConfigurator] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  const {
    services,
    metrics,
    isLoadingServices,
    servicesError,
    isCreating,
    isUpdating,
    isDeleting,
    createService,
    updateService,
    deleteService,
    bulkUpdate,
    filterServices,
    getAvailableCategories,
    getServiceMetrics
  } = useServiceConfiguration()

  // Redirect if not admin
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  // Apply filters
  const filteredServices = filterServices({
    ...filters,
    search: searchQuery || undefined
  })

  const categories = getAvailableCategories()
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0)

  const handleCreateService = async (data: CreateServiceInput) => {
    await createService(data)
    setShowConfigurator(false)
  }

  const handleUpdateService = async (data: UpdateServiceInput) => {
    await updateService(data)
    setShowConfigurator(false)
    setEditingService(null)
  }

  const handleEditService = (service: any) => {
    // Transform service data to match Service interface
    const transformedService: Service = {
      ...service,
      status: service.currentStatus?.status || 'OFFLINE',
      healthCheckUrl: service.healthEndpoint
    }
    setEditingService(transformedService)
    setShowConfigurator(true)
  }

  const handleDeleteService = async () => {
    if (!serviceToDelete) return
    await deleteService(serviceToDelete)
    setServiceToDelete(null)
    setShowDeleteModal(false)
  }

  const handleBulkUpdate = async (updates: Partial<UpdateServiceInput>) => {
    await bulkUpdate(selectedServices, updates)
    setSelectedServices([])
    setShowBulkActions(false)
  }

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const selectAllServices = () => {
    setSelectedServices(filteredServices.map(s => s.id))
  }

  const clearSelection = () => {
    setSelectedServices([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      case 'OFFLINE': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const formatResponseTime = (time: number | null) => {
    if (!time) return 'N/A'
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Advanced Service Configuration
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Configure and manage your services with advanced monitoring options
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedServices.length > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <CogIcon className="w-4 h-4 mr-2" />
                  Bulk Actions ({selectedServices.length})
                </button>
              )}
              
              <button
                onClick={() => {
                  setEditingService(null)
                  setShowConfigurator(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Service
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 relative ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Selection Controls */}
              {filteredServices.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={selectAllServices}
                    className="hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Select All
                  </button>
                  {selectedServices.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title="List view"
                >
                  <ViewColumnsIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setFilters({})
                      setSearchQuery('')
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All statuses</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Active Status
                  </label>
                  <select
                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All services</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedServices.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkUpdate({ category: 'maintenance' })}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded"
                  >
                    Set Maintenance
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ category: 'web' })}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Set Web Category
                  </button>
                  <button
                    onClick={() => setShowBulkActions(false)}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                  >
                    <XMarkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {servicesError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading services:</h3>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{servicesError.message}</p>
          </div>
        )}

        {/* Services Grid/List */}
        {isLoadingServices ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <ServerIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeFiltersCount > 0 
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first service.'}
            </p>
            {activeFiltersCount === 0 && (
              <button
                onClick={() => setShowConfigurator(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Service
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredServices.map((service) => {
              const serviceMetrics = getServiceMetrics(service.id)
              const isSelected = selectedServices.includes(service.id)
              
              if (viewMode === 'list') {
                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 ring-opacity-20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleServiceSelection(service.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {service.name}
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.currentStatus?.status || 'OFFLINE')}`}>
                                {service.currentStatus?.status || 'UNKNOWN'}
                              </span>
                              {!service.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                              {service.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <GlobeAltIcon className="w-4 h-4 mr-1" />
                                <span className="truncate">{service.url}</span>
                              </div>
                              {serviceMetrics && (
                                <>
                                  <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    <span>{formatResponseTime(serviceMetrics.avgResponseTime)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <BoltIcon className="w-4 h-4 mr-1" />
                                    <span>{Math.round(serviceMetrics.uptime)}% uptime</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit service"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setServiceToDelete(service.id)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete service"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={service.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-6 transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 ring-opacity-20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleServiceSelection(service.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-8">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.currentStatus?.status || 'OFFLINE')}`}>
                            {service.currentStatus?.status || 'UNKNOWN'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            {service.category}
                          </span>
                          {!service.isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <GlobeAltIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{service.url}</span>
                    </div>
                    
                    {service.healthEndpoint && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ShieldCheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{service.healthEndpoint}</span>
                      </div>
                    )}
                    
                    {serviceMetrics && (
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Response Time</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatResponseTime(serviceMetrics.avgResponseTime)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.round(serviceMetrics.uptime)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(service.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit service"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setServiceToDelete(service.id)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete service"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Service Configurator Modal */}
      <ServiceConfigurator
        service={editingService || undefined}
        isOpen={showConfigurator}
        onClose={() => {
          setShowConfigurator(false)
          setEditingService(null)
        }}
        onSave={async (data) => {
          if (editingService) {
            await handleUpdateService(data as UpdateServiceInput)
          } else {
            await handleCreateService(data as CreateServiceInput)
          }
        }}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && serviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Service
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this service? This action cannot be undone and all associated monitoring data will be lost.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setServiceToDelete(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteService}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Delete Service</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}