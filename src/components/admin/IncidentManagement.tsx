'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CheckCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

interface CreateIncidentForm {
  title: string
  description: string
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  affectedServices: string[]
  impactedUsers: number
  assignedTo?: string
}

export default function IncidentManagement() {
  const { addToast } = useNotifications()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<CreateIncidentForm>({
    title: '',
    description: '',
    severity: 'MAJOR',
    affectedServices: [],
    impactedUsers: 0,
  })

  const { data: incidents, isLoading: incidentsLoading, refetch: refetchIncidents } = trpc.health.getActiveIncidents?.useQuery() ?? { data: [], isLoading: false, refetch: () => {} }
  const { data: services } = trpc.services.getAll.useQuery()
  const { data: users } = trpc.users.getAll.useQuery()

  const createIncidentMutation = trpc.health.createIncident?.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Incident Created',
        message: 'Incident has been created and stakeholders notified'
      })
      refetchIncidents()
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        severity: 'MAJOR',
        affectedServices: [],
        impactedUsers: 0,
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    },
  }) ?? { mutate: () => {}, isPending: false }

  const resolveIncidentMutation = trpc.health.acknowledgeIssue.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Incident Acknowledged',
        message: 'Incident has been acknowledged successfully'
      })
      refetchIncidents()
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    },
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'MAJOR':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'MINOR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🔴'
      case 'MAJOR':
        return '🟡'
      case 'MINOR':
        return '🟢'
      default:
        return '⚪'
    }
  }

  const handleCreateIncident = () => {
    if (!formData.title || !formData.description) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Title and description are required'
      })
      return
    }

    createIncidentMutation.mutate(formData)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Incident Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and resolve system incidents
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Incident</span>
        </button>
      </div>

      {/* Active Incidents */}
      <div className="space-y-4">
        {incidentsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : incidents && incidents.length > 0 ? (
          incidents.map((incident: any) => (
            <div
              key={incident.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSeverityIcon(incident.severity)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {incident.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => resolveIncidentMutation.mutate({ issueId: incident.id })}
                    disabled={resolveIncidentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center space-x-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {incident.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(incident.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Affected Services:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {incident.affectedServices.length} services
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Impact:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {incident.impactedUsers} users
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {incident.assignedTo || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Incidents
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All systems are running smoothly. Create an incident if issues arise.
            </p>
          </div>
        )}
      </div>

      {/* Create Incident Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Incident
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of the incident"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value as 'MINOR' | 'MAJOR' | 'CRITICAL'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="MINOR">🟢 Minor</option>
                    <option value="MAJOR">🟡 Major</option>
                    <option value="CRITICAL">🔴 Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Detailed description of the incident and its impact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Impacted Users
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.impactedUsers}
                    onChange={(e) => setFormData({...formData, impactedUsers: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                {users && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign to
                    </label>
                    <select
                      value={formData.assignedTo || ''}
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.username}
                        </option>
                      ))}
                    </select>
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
                  onClick={handleCreateIncident}
                  disabled={createIncidentMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {createIncidentMutation.isPending ? 'Creating...' : 'Create Incident'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}