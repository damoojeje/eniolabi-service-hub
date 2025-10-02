'use client'

import React, { useState, useMemo } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  PlusIcon,
  FolderIcon,
  FolderPlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ServerIcon,
  TagIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ServiceGroup {
  id: string
  name: string
  description: string
  color: string
  services: string[]
  createdAt: Date
}

interface GroupFormData {
  name: string
  description: string
  color: string
  services: string[]
}

export default function ServiceGroups() {
  const { addToast } = useNotifications()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    services: []
  })

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = trpc.services.getAll.useQuery()

  // Mock service groups (in real implementation, this would be from backend)
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([
    {
      id: 'group1',
      name: 'Production Services',
      description: 'Critical production services',
      color: '#EF4444',
      services: [],
      createdAt: new Date()
    },
    {
      id: 'group2',
      name: 'Development Services',
      description: 'Development environment services',
      color: '#10B981',
      services: [],
      createdAt: new Date()
    }
  ])

  const createGroupMutation = trpc.services.createGroup.useMutation({
    onSuccess: (data) => {
      // In real implementation, this would add to the actual list
      setServiceGroups(prev => [...prev, {
        ...data,
        createdAt: new Date()
      }])

      addToast({
        type: 'success',
        title: 'Group Created',
        message: `Service group "${data.name}" has been created successfully`
      })

      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        services: []
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Gray', value: '#6B7280' }
  ]

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleCreateGroup = () => {
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Group name is required'
      })
      return
    }

    createGroupMutation.mutate(formData)
  }

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }))
  }

  const getServicesByIds = (serviceIds: string[]) => {
    return services.filter(service => serviceIds.includes(service.id))
  }

  const ungroupedServices = useMemo(() => {
    const groupedServiceIds = serviceGroups.flatMap(group => group.services)
    return services.filter(service => !groupedServiceIds.includes(service.id))
  }, [services, serviceGroups])

  const getServiceStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500'
      case 'WARNING': return 'bg-yellow-500'
      case 'ERROR': return 'bg-orange-500'
      case 'OFFLINE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Groups
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and manage services in logical groups
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FolderPlusIcon className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Service Groups */}
      <div className="space-y-4">
        {serviceGroups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Group Header */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <FolderIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {group.description} • {group.services.length} services
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Group Services (when expanded) */}
            {expandedGroups.has(group.id) && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                {group.services.length === 0 ? (
                  <div className="text-center py-8">
                    <ServerIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">No services in this group</p>
                    <p className="text-xs text-gray-400">Add services to organize them</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getServicesByIds(group.services).map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${getServiceStatusColor(service.currentStatus?.status)}`}></div>
                        <ServerIcon className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {service.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Ungrouped Services */}
        {ungroupedServices.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <FolderIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Ungrouped Services
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Services not assigned to any group • {ungroupedServices.length} services
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ungroupedServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${getServiceStatusColor(service.currentStatus?.status)}`}></div>
                    <ServerIcon className="w-4 h-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {service.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {service.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Service Group
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Describe the purpose of this group"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color Theme
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({...formData, color: color.value})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-gray-400 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Services to Include (Optional)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    {servicesLoading ? (
                      <div className="py-4 text-center text-gray-500">Loading services...</div>
                    ) : services.length === 0 ? (
                      <div className="py-4 text-center text-gray-500">No services available</div>
                    ) : (
                      services.map((service) => (
                        <label key={service.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className={`w-2 h-2 rounded-full ${getServiceStatusColor(service.currentStatus?.status)}`}></div>
                          <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                          <span className="text-xs text-gray-500">({service.category})</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}