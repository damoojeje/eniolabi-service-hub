'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface MaintenanceForm {
  title: string
  description: string
  type: 'PLANNED' | 'EMERGENCY'
  startTime: string
  endTime: string
  affectedServices: string[]
  impactLevel: 'NO_IMPACT' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT'
}

export default function MaintenanceWindows() {
  const { addToast } = useNotifications()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<MaintenanceForm>({
    title: '',
    description: '',
    type: 'PLANNED',
    startTime: '',
    endTime: '',
    affectedServices: [],
    impactLevel: 'MINIMAL'
  })

  const { data: maintenanceWindows, isLoading, refetch } = trpc.health.getMaintenanceWindows.useQuery({
    upcoming: true,
    limit: 10
  })
  const { data: services } = trpc.services.getAll.useQuery()

  const scheduleMutation = trpc.health.scheduleMaintenanceWindow?.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Maintenance Scheduled',
        message: 'Maintenance window has been scheduled successfully'
      })
      refetch()
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        type: 'PLANNED',
        startTime: '',
        endTime: '',
        affectedServices: [],
        impactLevel: 'MINIMAL'
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  }) ?? { mutate: () => {}, isPending: false }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'NO_IMPACT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'MINIMAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'MODERATE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'SIGNIFICANT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const handleSchedule = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Title, start time, and end time are required'
      })
      return
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'End time must be after start time'
      })
      return
    }

    scheduleMutation.mutate({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      affectedServices: formData.affectedServices,
      impactLevel: formData.impactLevel
    })
  }

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Maintenance Windows
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule and manage system maintenance windows
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Maintenance Windows List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : maintenanceWindows && maintenanceWindows.length > 0 ? (
          maintenanceWindows.map((window: any) => (
            <div
              key={window.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {window.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(window.type)}`}>
                        {window.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(window.impactLevel)}`}>
                        {window.impactLevel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateTime(window.startTime)}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {window.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Start:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(window.startTime)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">End:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(window.endTime)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Affected Services:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {window.affectedServices?.length || 0} services
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Notifications:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {window.notificationsSent ? '✓ Sent' : '✗ Not sent'}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Maintenance Windows Scheduled
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Schedule a maintenance window to notify users of upcoming system maintenance.
            </p>
          </div>
        )}
      </div>

      {/* Schedule Maintenance Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Schedule Maintenance Window
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief title for the maintenance window"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'PLANNED' | 'EMERGENCY'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Impact Level
                    </label>
                    <select
                      value={formData.impactLevel}
                      onChange={(e) => setFormData({...formData, impactLevel: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="NO_IMPACT">No Impact</option>
                      <option value="MINIMAL">Minimal</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="SIGNIFICANT">Significant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
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
                    placeholder="Description of maintenance work to be performed"
                  />
                </div>

                {services && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Affected Services (Optional)
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                      {services.map((service: any) => (
                        <label key={service.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={formData.affectedServices.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  affectedServices: [...formData.affectedServices, service.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  affectedServices: formData.affectedServices.filter(id => id !== service.id)
                                })
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={scheduleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}