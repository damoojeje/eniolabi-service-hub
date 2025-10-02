'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import Link from 'next/link'
import { 
  CogIcon, 
  ServerIcon, 
  UsersIcon, 
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ServiceFormData {
  name: string
  url: string
  description: string
  category: string
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  healthCheckUrl?: string
  expectedResponseTime?: number
  retryAttempts?: number
  timeout?: number
}

interface SystemSettings {
  healthCheckInterval: number
  notificationRetention: number
  maxRetryAttempts: number
  timeoutThreshold: number
  maintenanceMode: boolean
  debugMode: boolean
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useNotifications()
  
  const [activeTab, setActiveTab] = useState('services')
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [serviceForm, setServiceForm] = useState<ServiceFormData>({
    name: '',
    url: '',
    description: '',
    category: '',
    status: 'ONLINE'
  })
  // System settings will now come from tRPC
  const { data: systemSettings, refetch: refetchSystemSettings } = trpc.systemSettings.get.useQuery()
  const [localSystemSettings, setLocalSystemSettings] = useState<SystemSettings>({
    healthCheckInterval: 300,
    notificationRetention: 30,
    maxRetryAttempts: 3,
    timeoutThreshold: 5000,
    maintenanceMode: false,
    debugMode: false
  })

  // Update local state when systemSettings loads
  React.useEffect(() => {
    if (systemSettings) {
      setLocalSystemSettings({
        healthCheckInterval: systemSettings.healthCheckInterval,
        notificationRetention: systemSettings.notificationRetention,
        maxRetryAttempts: systemSettings.maxRetryAttempts,
        timeoutThreshold: systemSettings.timeoutThreshold,
        maintenanceMode: systemSettings.maintenanceMode,
        debugMode: systemSettings.debugMode,
      })
    }
  }, [systemSettings])

  // tRPC queries and mutations
  const { data: services, refetch: refetchServices, error: servicesError } = trpc.services.getAll.useQuery()
  const { data: users, refetch: refetchUsers, error: usersError } = trpc.users.getAll.useQuery()
  const { data: systemStats, error: statsError } = trpc.services.getSystemStats.useQuery()

  // Log any errors for debugging
  if (servicesError) console.error('Services error:', servicesError)
  if (usersError) console.error('Users error:', usersError) 
  if (statsError) console.error('System stats error:', statsError)
  
  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Created',
        message: 'Service has been created successfully'
      })
      setShowServiceModal(false)
      resetServiceForm()
      refetchServices()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Updated',
        message: 'Service has been updated successfully'
      })
      setShowServiceModal(false)
      setEditingService(null)
      resetServiceForm()
      refetchServices()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Deleted',
        message: 'Service has been deleted successfully'
      })
      refetchServices()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const updateUserRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Role Updated',
        message: 'User role has been updated successfully'
      })
      refetchUsers()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const updateSystemSettingsMutation = trpc.systemSettings.update.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Settings Updated',
        message: 'System settings updated successfully'
      })
      refetchSystemSettings()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const toggleMaintenanceModeMutation = trpc.systemSettings.toggleMaintenanceMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Maintenance Mode',
        message: 'Maintenance mode toggled successfully'
      })
      refetchSystemSettings()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  const toggleDebugModeMutation = trpc.systemSettings.toggleDebugMode.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Debug Mode',
        message: 'Debug mode toggled successfully'
      })
      refetchSystemSettings()
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  })

  // Redirect if not admin
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      url: '',
      description: '',
      category: '',
      status: 'ONLINE'
    })
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingService) {
      updateServiceMutation.mutate({
        id: editingService,
        ...serviceForm
      })
    } else {
      createServiceMutation.mutate(serviceForm)
    }
  }

  const editService = (service: any) => {
    setEditingService(service.id)
    setServiceForm({
      name: service.name,
      url: service.url,
      description: service.description || '',
      category: service.category,
      status: service.currentStatus?.status || 'OFFLINE',
      healthCheckUrl: service.healthEndpoint || '',
      expectedResponseTime: service.expectedResponseTime,
      retryAttempts: service.retryAttempts,
      timeout: service.timeout
    })
    setShowServiceModal(true)
  }

  const deleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id)
    }
  }

  const updateUserRole = (userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role: role as any })
  }

  const tabs = [
    { id: 'services', name: 'Services', icon: ServerIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'settings', name: 'System Settings', icon: CogIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage services, users, and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user.username}
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 pb-20">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Service Management</h2>
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/system-settings"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>System Settings</span>
                </Link>
                <Link
                  href="/admin/services-config"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Advanced Config</span>
                </Link>
                <button
                  onClick={() => {
                    setEditingService(null)
                    resetServiceForm()
                    setShowServiceModal(true)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {servicesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error loading services:</h3>
                <p className="text-red-600 text-sm mt-1">{servicesError.message}</p>
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!services && !servicesError && (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading services...</p>
                </div>
              )}
              
              {Array.isArray(services) && services.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No services found</p>
                </div>
              )}
              
              {Array.isArray(services) && services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          service.currentStatus?.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                          service.currentStatus?.status === 'OFFLINE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {service.currentStatus?.status || 'UNKNOWN'}
                        </span>
                        <span className="text-xs text-gray-500">{service.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-500 break-all">{service.url}</p>
                    {service.healthEndpoint && (
                      <p className="text-xs text-gray-500">Health: {service.healthEndpoint}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => editService(service)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            
            {/* Error Display */}
            {usersError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error loading users:</h3>
                <p className="text-red-600 text-sm mt-1">{usersError.message}</p>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="GUEST">Guest</option>
                          <option value="POWER_USER">Power User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Health Check Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check Interval (seconds)</label>
                    <p className="text-2xl font-bold text-blue-600">{systemSettings?.healthCheckInterval ?? 300}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Retry Attempts</label>
                    <p className="text-2xl font-bold text-blue-600">{systemSettings?.maxRetryAttempts ?? 3}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timeout Threshold (ms)</label>
                    <p className="text-2xl font-bold text-blue-600">{systemSettings?.timeoutThreshold ?? 5000}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      systemSettings?.maintenanceMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {systemSettings?.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Debug Mode</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      systemSettings?.debugMode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {systemSettings?.debugMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Notification Retention (days)</span>
                    <span className="text-2xl font-bold text-blue-600">{systemSettings?.notificationRetention ?? 30}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>
            
            {/* Error Display */}
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium">Error loading system stats:</h3>
                <p className="text-red-600 text-sm mt-1">{statsError.message}</p>
              </div>
            )}
            
            {systemStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Services</h3>
                    <p className="text-3xl font-bold text-gray-900">{systemStats.totalServices}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Online Services</h3>
                    <p className="text-3xl font-bold text-green-600">{systemStats.onlineServices}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Warning Services</h3>
                    <p className="text-3xl font-bold text-yellow-600">{systemStats.warningServices || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Error Services</h3>
                    <p className="text-3xl font-bold text-red-600">{systemStats.errorServices || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average Response Time</h3>
                    <p className="text-3xl font-bold text-blue-600">{systemStats.avgResponseTime || 0}ms</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status Checks</h3>
                    <p className="text-3xl font-bold text-purple-600">{systemStats.totalStatusChecks || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Last 2 hours</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unknown Status</h3>
                    <p className="text-3xl font-bold text-gray-600">{systemStats.unknownServices || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">No recent data</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-gray-500 text-sm">Activity logs and system events will be displayed here.</p>
            </div>
          </div>
        )}
      </main>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="web">Web Services</option>
                      <option value="database">Database</option>
                      <option value="api">API</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service URL</label>
                  <input
                    type="url"
                    value={serviceForm.url}
                    onChange={(e) => setServiceForm({...serviceForm, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={serviceForm.status}
                      onChange={(e) => setServiceForm({...serviceForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="OFFLINE">Offline</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Check URL (Optional)</label>
                    <input
                      type="url"
                      value={serviceForm.healthCheckUrl || ''}
                      onChange={(e) => setServiceForm({...serviceForm, healthCheckUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Response Time (ms)</label>
                    <input
                      type="number"
                      value={serviceForm.expectedResponseTime || ''}
                      onChange={(e) => setServiceForm({...serviceForm, expectedResponseTime: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retry Attempts</label>
                    <input
                      type="number"
                      value={serviceForm.retryAttempts || ''}
                      onChange={(e) => setServiceForm({...serviceForm, retryAttempts: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
                    <input
                      type="number"
                      value={serviceForm.timeout || ''}
                      onChange={(e) => setServiceForm({...serviceForm, timeout: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit System Settings</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Check Interval (seconds)</label>
                    <input
                      type="number"
                      value={localSystemSettings.healthCheckInterval}
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, healthCheckInterval: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Retention (days)</label>
                    <input
                      type="number"
                      value={localSystemSettings.notificationRetention}
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, notificationRetention: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Retry Attempts</label>
                    <input
                      type="number"
                      value={localSystemSettings.maxRetryAttempts}
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, maxRetryAttempts: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeout Threshold (ms)</label>
                    <input
                      type="number"
                      value={localSystemSettings.timeoutThreshold}
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, timeoutThreshold: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                    <button
                      onClick={() => toggleMaintenanceModeMutation.mutate()}
                      disabled={toggleMaintenanceModeMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSystemSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                      } ${toggleMaintenanceModeMutation.isPending ? 'opacity-50' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSystemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Debug Mode</span>
                    <button
                      onClick={() => toggleDebugModeMutation.mutate()}
                      disabled={toggleDebugModeMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSystemSettings.debugMode ? 'bg-blue-600' : 'bg-gray-200'
                      } ${toggleDebugModeMutation.isPending ? 'opacity-50' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSystemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateSystemSettingsMutation.mutate({
                        healthCheckInterval: localSystemSettings.healthCheckInterval,
                        notificationRetention: localSystemSettings.notificationRetention,
                        maxRetryAttempts: localSystemSettings.maxRetryAttempts,
                        timeoutThreshold: localSystemSettings.timeoutThreshold,
                        maintenanceMode: localSystemSettings.maintenanceMode,
                        debugMode: localSystemSettings.debugMode,
                      })
                      setShowSettingsModal(false)
                    }}
                    disabled={updateSystemSettingsMutation.isPending}
                    className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors ${
                      updateSystemSettingsMutation.isPending ? 'opacity-50' : ''
                    }`}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}