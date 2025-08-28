'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import NotificationCenter from '@/components/NotificationCenter'
import AppleClock from '@/components/ui/AppleClock'
import { 
  MagnifyingGlassIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ServerIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { 
  getArrayFromData, 
  getStatusColor, 
  getStatusIcon, 
  getCategoryIcon,
  getCardClasses,
  getHeaderClasses,
  getTextClasses,
  getBackgroundClasses
} from '@/shared'
import Link from 'next/link'

type ViewMode = 'grid' | 'list' | 'compact'
type SortBy = 'name' | 'status' | 'category' | 'lastChecked'
type FilterStatus = 'all' | 'online' | 'offline' | 'maintenance'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addToast } = useNotifications()
  
  // State management - ALL HOOKS MUST BE CALLED FIRST
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())

  // tRPC queries and mutations - ALL HOOKS MUST BE CALLED FIRST
  const { data: services, refetch: refetchServices, error: servicesError } = trpc.services.getAll.useQuery()
  const { error: statsError } = trpc.services.getStats.useQuery()
  
  // Real-time updates - MUST BE CALLED WITH OTHER HOOKS
  useRealTimeUpdates({
    session, // Pass session from dashboard component
    onServiceStatusUpdate: () => {
      refetchServices()
    },
    onHealthCheckTriggered: () => {
      refetchServices()
    },
    onConnected: () => {
      console.log('✅ Real-time updates connected')
    },
    onError: (error) => {
      console.error('❌ Real-time updates error:', error)
      addToast({
        type: 'error',
        title: 'Real-time Updates Error',
        message: error
      })
    }
  })
  
  const startServiceMutation = trpc.services.startService.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Started',
        message: 'Service has been started successfully'
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

  const stopServiceMutation = trpc.services.stopService.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Stopped',
        message: 'Service has been stopped successfully'
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

  const restartServiceMutation = trpc.services.restartService.useMutation({
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Service Restarted',
        message: 'Service has been restarted successfully'
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

  // Handle query errors - AFTER all hooks are defined
  useEffect(() => {
    if (servicesError) {
      console.error('Services query error:', servicesError)
      addToast({
        type: 'error',
        title: 'Failed to load services',
        message: 'Please try refreshing the page'
      })
    }
  }, [servicesError, addToast])
  
  useEffect(() => {
    if (statsError) {
      console.error('Stats query error:', statsError)
    }
  }, [statsError])

  // Redirect if not authenticated - AFTER all hooks are defined
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Theme management
  useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    } catch (error) {
      // Fallback to light mode if document is not available
      setIsDarkMode(false)
    }
  }, [])

  const toggleTheme = () => {
    try {
      const newDarkMode = !isDarkMode
      setIsDarkMode(newDarkMode)
      document.documentElement.classList.toggle('dark', newDarkMode)
    } catch (error) {
      // Fallback if document is not available
      setIsDarkMode(!isDarkMode)
    }
  }

  // Helper functions
  const getServicesArray = () => getArrayFromData(services)

  const countServicesByStatus = (status: string) => {
    const servicesArray = getServicesArray()
    return servicesArray.filter(s => s.currentStatus?.status === status).length
  }

  const getFilteredAndSortedServices = () => {
    let servicesArray = getServicesArray()
    
    // Safety check to ensure we have an array
    if (!Array.isArray(servicesArray)) {
      console.error('servicesArray is not an array:', typeof servicesArray, servicesArray)
      return []
    }
    
    // Apply search filter
    if (searchQuery) {
      servicesArray = servicesArray.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      servicesArray = servicesArray.filter(service => service.currentStatus?.status === filterStatus.toUpperCase())
    }
    
    // Apply sorting
    servicesArray.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return (a.currentStatus?.status || 'OFFLINE').localeCompare(b.currentStatus?.status || 'OFFLINE')
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        case 'lastChecked':
          return new Date(b.lastChecked || 0).getTime() - new Date(a.lastChecked || 0).getTime()
        default:
          return 0
      }
    })
    
    return servicesArray
  }

  const getStatusIconComponent = (status: string) => {
    const IconComponent = getStatusIcon(status)
    return <IconComponent className="h-5 w-5 text-green-600" />
  }

  const getCategoryIconComponent = (category: string) => {
    const IconComponent = getCategoryIcon(category)
    return <IconComponent className="h-5 w-5" />
  }

  const canManageServices = session?.user.role === 'ADMIN' || session?.user.role === 'POWER_USER'

  // Get filtered and sorted services for display
  const filteredServices = getFilteredAndSortedServices()
  const totalServices = filteredServices.length
  const onlineServices = countServicesByStatus('ONLINE')
  const offlineServices = countServicesByStatus('OFFLINE')
  const maintenanceServices = countServicesByStatus('MAINTENANCE')

  // Single render function - NO CONDITIONAL RETURNS
  const renderContent = () => {
    // Show loading while checking authentication
    if (status === 'loading') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    // Don't render anything if not authenticated
    if (status === 'unauthenticated' || !session?.user) {
      return null
    }

    // Show loading while data is being fetched
    if (!services && !servicesError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      )
    }

    // Main dashboard content
    return (
    <div className={`min-h-screen transition-colors duration-300 ${getBackgroundClasses(isDarkMode)}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors duration-300 ${getHeaderClasses(isDarkMode)}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Service Hub Dashboard
              </h1>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Monitor and manage your services in real-time
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Apple Clock */}
              <AppleClock className={`transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`} />
              
              {/* Notes Link */}
              <Link
                href="/notes"
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="View Notes"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Notes</span>
              </Link>
              
              {/* Notification Center */}
              <NotificationCenter />
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <UserIcon className={`h-5 w-5 ${
                      isDarkMode ? 'text-white' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {session?.user.username || 'User'}
                    </p>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {session?.user.role || 'Guest'}
                    </p>
                  </div>
                </div>
                
                {/* Settings Button */}
                <button
                  onClick={() => router.push('/settings')}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Settings"
                >
                  <CogIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Admin Panel Links */}
              {session?.user.role === 'ADMIN' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/admin')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <CogIcon className="h-4 w-4 inline mr-2" />
                    Admin Panel
                  </button>
                  
                  <Link
                    href="/admin/users"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Manage Users"
                  >
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Users
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 pb-20">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg p-6 transition-colors duration-300 ${getCardClasses(isDarkMode)} border shadow-sm`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ServerIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-300 ${getTextClasses(isDarkMode, 'secondary')}`}>Total Services</p>
                <p className="text-2xl font-bold text-blue-600">{totalServices}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border shadow-sm`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineServices}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border shadow-sm`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Offline</p>
                <p className="text-2xl font-bold text-red-600">{offlineServices}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border shadow-sm`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceServices}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className={`rounded-lg p-4 mb-6 transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-1 items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className={`px-3 py-2 border rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className={`px-3 py-2 border rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="category">Sort by Category</option>
                <option value="lastChecked">Sort by Last Checked</option>
              </select>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className={`flex rounded-lg p-1 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === 'compact'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              {canManageServices && selectedServices.size > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      selectedServices.forEach(serviceId => {
                        startServiceMutation.mutate({ serviceId })
                      })
                      setSelectedServices(new Set())
                    }}
                    className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <PlayIcon className="h-4 w-4 inline mr-1" />
                    Start All
                  </button>
                  <button
                    onClick={() => setSelectedServices(new Set())}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className={`text-center py-12 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <ServerIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${viewMode === 'compact' ? 'p-3' : 'p-6'}`}
              >
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIconComponent(service.category)}
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } ${viewMode === 'compact' ? 'text-sm' : 'text-base'}`}>
                        {service.name}
                      </h3>
                    </div>
                    
                    {viewMode !== 'compact' && (
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      } line-clamp-2`}>
                        {service.description || 'No description available'}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium border ${
                    getStatusColor(service.currentStatus?.status || 'OFFLINE')
                  }`}>
                    {getStatusIconComponent(service.currentStatus?.status || 'OFFLINE')}
                    <span>{service.currentStatus?.status || 'OFFLINE'}</span>
                  </div>
                </div>

                {/* Service Details */}
                {viewMode !== 'compact' && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Category:</span>
                      <span className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{service.category || 'Uncategorized'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>URL:</span>
                      <span className={`font-mono text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      } truncate max-w-32`}>{service.url}</span>
                    </div>

                    {service.currentStatus?.responseTime && (
                      <div className="flex items-center justify-between text-xs">
                        <span className={`transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Response Time:</span>
                        <span className={`font-medium transition-colors duration-300 ${
                          (service.currentStatus?.responseTime || 0) < 1000 ? 'text-green-600' : 
                          (service.currentStatus?.responseTime || 0) < 3000 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {service.currentStatus?.responseTime || 0}ms
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                {canManageServices && (
                  <div className="flex items-center space-x-2">
                                      <button
                    onClick={() => startServiceMutation.mutate({ serviceId: service.id })}
                    disabled={startServiceMutation.isPending}
                    className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors"
                    title="Start Service"
                  >
                    <PlayIcon className="h-3 w-3 inline mr-1" />
                    Start
                  </button>
                  <button
                    onClick={() => stopServiceMutation.mutate({ serviceId: service.id })}
                    disabled={stopServiceMutation.isPending}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors"
                    title="Stop Service"
                  >
                    <StopIcon className="h-3 w-3 inline mr-1" />
                    Stop
                  </button>
                  <button
                    onClick={() => restartServiceMutation.mutate({ serviceId: service.id })}
                    disabled={restartServiceMutation.isPending}
                    className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 transition-colors"
                    title="Restart Service"
                  >
                    <ArrowPathIcon className="h-3 w-3" />
                  </button>
                  </div>
                )}

                {/* Selection Checkbox */}
                {canManageServices && (
                  <div className="mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedServices.has(service.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedServices)
                          if (e.target.checked) {
                            newSelected.add(service.id)
                          } else {
                            newSelected.delete(service.id)
                          }
                          setSelectedServices(newSelected)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-xs transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Select for bulk action</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Information Density Section */}
        {viewMode !== 'compact' && (
          <div className="mt-12">
            <h2 className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>System Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Uptime Statistics */}
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-sm`}>
                <h3 className={`font-medium mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Uptime Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Overall Uptime</span>
                    <span className="text-lg font-bold text-green-600">
                      {totalServices > 0 ? Math.round((onlineServices / totalServices) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalServices > 0 ? (onlineServices / totalServices) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {onlineServices} of {totalServices} services online
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-sm`}>
                <h3 className={`font-medium mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Avg Response Time</span>
                    <span className="text-lg font-bold text-blue-600">
                      {filteredServices.length > 0 
                        ? Math.round(filteredServices.reduce((acc, s) => acc + (s.currentStatus?.responseTime || 0), 0) / filteredServices.length)
                        : 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Fast Services</span>
                    <span className="text-lg font-bold text-green-600">
                      {filteredServices.filter(s => s.currentStatus?.responseTime && s.currentStatus.responseTime < 1000).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Slow Services</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {filteredServices.filter(s => s.currentStatus?.responseTime && s.currentStatus.responseTime > 3000).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Health */}
              <div className={`rounded-lg p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-sm`}>
                <h3 className={`font-medium mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Service Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Healthy</span>
                    <span className="text-lg font-bold text-green-600">{onlineServices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Warning</span>
                    <span className="text-lg font-bold text-yellow-600">{maintenanceServices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Critical</span>
                    <span className="text-lg font-bold text-red-600">{offlineServices}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    )
  }

  // Call the render function - NO CONDITIONAL RETURNS
  return renderContent()
}