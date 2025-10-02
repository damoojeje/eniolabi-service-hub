'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  DocumentTextIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

interface ServiceFromTemplate {
  templateId: string
  name: string
  url: string
  description: string
  healthCheckUrl?: string
}

export default function ServiceTemplates() {
  const { addToast } = useNotifications()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<ServiceFromTemplate>({
    templateId: '',
    name: '',
    url: '',
    description: '',
    healthCheckUrl: '',
  })

  const { data: templates, isLoading } = trpc.services.getTemplates.useQuery()
  const { refetch: refetchServices } = trpc.services.getAll.useQuery()

  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Created',
        message: 'Service created successfully from template'
      })
      refetchServices()
      setShowCreateForm(false)
      setFormData({
        templateId: '',
        name: '',
        url: '',
        description: '',
        healthCheckUrl: '',
      })
      setSelectedTemplate('')
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    },
  })

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setFormData({
        templateId,
        name: '',
        url: '',
        description: '',
        healthCheckUrl: template.requiredFields.includes('healthCheckUrl') ? '' : undefined,
      })
    }
  }

  const handleCreateService = () => {
    const template = templates?.find(t => t.id === selectedTemplate)
    if (!template) return

    const serviceData = {
      name: formData.name,
      url: formData.url,
      description: formData.description,
      category: template.category,
      healthCheckUrl: formData.healthCheckUrl || formData.url,
      expectedResponseTime: template.defaultConfig.expectedResponseTime,
      timeoutSeconds: template.defaultConfig.timeoutSeconds,
      retryAttempts: template.defaultConfig.retryAttempts,
      enableAlerts: template.defaultConfig.enableAlerts,
      followRedirects: template.defaultConfig.followRedirects || false,
      validateSSL: template.defaultConfig.validateSSL || false,
      authRequired: template.defaultConfig.authRequired || false,
    }

    createServiceMutation.mutate(serviceData)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Templates
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pre-configured templates for common service types
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Service</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates?.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {template.category}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {template.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Default Config:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Response: {template.defaultConfig.expectedResponseTime}ms</div>
                <div>Timeout: {template.defaultConfig.timeoutSeconds}s</div>
                <div>Retries: {template.defaultConfig.retryAttempts}</div>
                <div>Alerts: {template.defaultConfig.enableAlerts ? '✓' : '✗'}</div>
              </div>
            </div>

            <button
              onClick={() => {
                handleTemplateSelect(template.id)
                setShowCreateForm(true)
              }}
              className="w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>

      {/* Create Service Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Service from Template
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedTemplate('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedTemplate && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                    <span>{templates?.find(t => t.id === selectedTemplate)?.icon}</span>
                    <span className="font-medium">
                      {templates?.find(t => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="My Web Service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Description of your service"
                  />
                </div>

                {formData.healthCheckUrl !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Health Check URL
                    </label>
                    <input
                      type="url"
                      value={formData.healthCheckUrl}
                      onChange={(e) => setFormData({...formData, healthCheckUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com/health"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedTemplate('')
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateService}
                  disabled={!formData.name || !formData.url || !formData.description || createServiceMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}