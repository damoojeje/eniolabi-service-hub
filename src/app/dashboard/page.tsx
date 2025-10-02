'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates'
import NotificationDropdown from '@/components/NotificationDropdown'
import AppleClock from '@/components/ui/AppleClock'
import ServiceIcon from '@/components/ServiceIcon'
import ThemeToggle from '@/components/ui/ThemeToggle'
import AdminPanel from '@/components/AdminPanel'
import { useAdmin } from '@/contexts/AdminContext'
import Image from 'next/image'
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
import { getArrayFromData } from '@/shared/arrayUtils'
import { getStatusColor, getStatusIcon } from '@/shared/statusConfig'
import { getCategoryIcon } from '@/shared/statusUtils'
import { getCardClasses, getTextClasses, getBackgroundClasses } from '@/shared/themeUtils'
import { useTheme } from '@/contexts/ThemeContext'
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

  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { openSection } = useAdmin()

  // tRPC queries and mutations - ALL HOOKS MUST BE CALLED FIRST
  const { data: services, refetch: refetchServices, error: servicesError } = trpc.services.getAll.useQuery()
  const { error: statsError } = trpc.services.getStats.useQuery()
  
  // Real-time updates - MUST BE CALLED WITH OTHER HOOKS
  useRealTimeUpdates({
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

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Theme management is now handled by useThemeManagement hook

  // Theme toggle function is now provided by useThemeManagement hook

  // Helper functions
  const getServicesArray = () => getArrayFromData(services)

  const countServicesByStatus = (status: string) => {
    const servicesArray = getServicesArray()
    return servicesArray.filter((s: any) => s.currentStatus?.status === status).length
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
      servicesArray = servicesArray.filter((service: any) =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      servicesArray = servicesArray.filter((service: any) => service.currentStatus?.status === filterStatus.toUpperCase())
    }
    
    // Apply sorting
    servicesArray.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0
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
    const IconComponent = getStatusIcon(status.toUpperCase() as 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE' | 'UNKNOWN')
    return <IconComponent className="h-5 w-5 text-green-600" />
  }

  const getServiceIconComponent = (serviceName: string) => {
    return <ServiceIcon serviceName={serviceName} className="h-5 w-5" />
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
      {/* Modern Clean Header */}
      <header className="bg-white dark:bg-black shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-3 animate-fade-in">
              <Image 
                src="/logo.svg" 
                alt="Eniolabi Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
              />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Service Hub
              </h1>
            </div>
            
            {/* Center: Date and Time - Full Width */}
            <div className="flex-1 flex flex-col items-center space-y-1 animate-fade-in-delay-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-2xl font-light text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
            
            {/* Right: Notifications and User */}
            <div className="flex items-center space-x-6 animate-fade-in-delay-2">
              {/* Notifications */}
              <NotificationDropdown />
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {session?.user?.username?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 hidden sm:flex">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {session?.user?.username || 'Administrator'}
                    </span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Enhanced User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 py-2">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {session?.user?.image ? (
                            <img
                              src={session.user.image}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {session?.user?.username?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                          )}
                  </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {session?.user?.username || 'Administrator'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {session?.user?.email || 'admin@eniolabi.com'}
                          </div>
                        </div>
                  </div>
                </div>
                
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
                        Profile
                      </Link>
                      <Link href="/admin/system-settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <CogIcon className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                      </Link>
                      <Link href="/notes" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <DocumentTextIcon className="h-4 w-4 mr-3 text-gray-500" />
                        Notes
                      </Link>
                    </div>

                    {/* Admin Section */}
                  {session?.user.role === 'ADMIN' && (
                      <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openSection('overview')
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CogIcon className="h-4 w-4 mr-3 text-gray-500" />
                          Admin Panel
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openSection('user-analytics')
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <UserIcon className="h-4 w-4 mr-3 text-gray-500" />
                          User Management
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openSection('service-templates')
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CogIcon className="h-4 w-4 mr-3 text-gray-500" />
                          Service Configuration
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            openSection('analytics')
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChartBarIcon className="h-4 w-4 mr-3 text-gray-500" />
                          Analytics
                        </button>
                    </div>
                  )}
                
                    <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                  </svg>
                        Logout
                </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-0 lg:px-1 py-4 pb-12">

        {/* Modern Controls Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-3 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            {/* Search and Filters */}
            <div className="flex flex-1 items-center space-x-2">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
                />
              </div>

              {/* Modern Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>

              {/* Modern Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="category">Sort by Category</option>
                <option value="lastChecked">Sort by Last Checked</option>
              </select>
            </div>

            {/* Modern View Controls */}
            <div className="flex items-center space-x-1">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                   className={`p-1.5 rounded-md transition-all duration-300 ${
                    viewMode === 'grid'
                       ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                       : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                   }`}
                  title="Grid View"
                >
                  <ViewColumnsIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                  }`}
                  title="List View"
                >
                  <ChartBarIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-md transition-all duration-300 ${
                    viewMode === 'compact'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                  }`}
                  title="Compact View"
                >
                  <EyeIcon className="h-3.5 w-3.5" />
                </button>
              </div>
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
            {filteredServices.map((service: any, index) => (
              <div
                key={service.id}
                className={`relative rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 hover:dark:border-blue-600 hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-black border-gray-800 hover:bg-gray-900'
                    : 'bg-white border-gray-200 hover:bg-blue-50/30'
                } p-4 group`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Opening service:', service.name, 'URL:', service.url);
                  // Open service URL in new tab
                  window.open(service.url, '_blank', 'noopener,noreferrer');
                }}
                title={`${service.name} - ${service.currentStatus?.status || 'Unknown'}`}
              >
                {/* Rectangular Card Layout */}
                <div className="flex items-center space-x-4">
            {/* Service Icon with Status */}
            <div className="relative flex-shrink-0 group">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-blue-50 group-hover:dark:bg-blue-900/20 group-hover:scale-105 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <ServiceIcon serviceName={service.name} className="h-8 w-8" showHoverEffect={true} />
              </div>
                    {/* Status Dot */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${
                      isDarkMode ? 'border-gray-800' : 'border-white'
                    } ${
                      service.currentStatus?.status === 'ONLINE' 
                        ? 'bg-green-500' 
                        : service.currentStatus?.status === 'MAINTENANCE'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}></div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {service.name}
                      </h3>
                      
                      {/* Status Badge */}
                      <div className={`flex-shrink-0 ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        service.currentStatus?.status === 'ONLINE' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : service.currentStatus?.status === 'MAINTENANCE'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {service.currentStatus?.status || 'OFFLINE'}
                      </div>
                  </div>
                  
                    {/* Simple Description */}
                    {service.description && (
                      <p className={`text-xs mt-1 truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {service.description.split('.')[0].substring(0, 40)}
                        {service.description.length > 40 ? '...' : ''}
                      </p>
                    )}
                    
                    {/* Category Tag */}
                    {service.category && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {service.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button - Only if service is offline and user can manage */}
                {canManageServices && service.currentStatus?.status !== 'ONLINE' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        console.log('Restarting service:', service.id)
                        restartServiceMutation.mutate({ serviceId: service.id })
                      }}
                      disabled={restartServiceMutation.isPending}
                 className={`w-full px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                   restartServiceMutation.isPending
                     ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                     : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700'
                 } flex items-center justify-center space-x-1`}
                      title="Restart Service"
                    >
                      {restartServiceMutation.isPending ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Restarting...</span>
                        </>
                      ) : (
                        <>
                      <ArrowPathIcon className="h-3 w-3" />
                          <span>Restart</span>
                        </>
                      )}
                    </button>
                  </div>
                )}


              </div>
            ))}
          </div>
        )}

        {/* Information Density Section */}
        {viewMode !== 'compact' && (
          <div className="mt-12 animate-fade-in-delay-3">
            <h2 className={`text-xl font-semibold mb-6 transition-all duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>System Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Uptime Statistics */}
              <div className={`rounded-lg p-6 transition-all duration-500 card-apple ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-apple animate-slide-up`}>
                <h3 className={`font-medium mb-4 transition-all duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Uptime Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-all duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Overall Uptime</span>
                    <span className="text-lg font-bold text-green-600 animate-bounce-in">
                      {totalServices > 0 ? Math.round((onlineServices / totalServices) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="progress-apple h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        '--progress-width': `${totalServices > 0 ? (onlineServices / totalServices) * 100 : 0}%`,
                        width: `${totalServices > 0 ? (onlineServices / totalServices) * 100 : 0}%`
                      } as React.CSSProperties}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 animate-fade-in-delay-1">
                    {onlineServices} of {totalServices} services online
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className={`rounded-lg p-6 transition-all duration-500 card-apple ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-apple animate-slide-up animate-fade-in-delay-1`}>
                <h3 className={`font-medium mb-4 transition-all duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Avg Response Time</span>
                    <span className="text-lg font-bold text-blue-600">
                      {filteredServices.length > 0 
                        ? Math.round(filteredServices.reduce((acc: number, s: any) => acc + (s.currentStatus?.responseTime || 0), 0) / filteredServices.length)
                        : 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Fast Services</span>
                    <span className="text-lg font-bold text-green-600">
                      {filteredServices.filter((s: any) => s.currentStatus?.responseTime && s.currentStatus.responseTime < 1000).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>Slow Services</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {filteredServices.filter((s: any) => s.currentStatus?.responseTime && s.currentStatus.responseTime > 3000).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Health */}
              <div className={`rounded-lg p-6 transition-all duration-500 card-apple ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border shadow-apple animate-slide-up animate-fade-in-delay-2`}>
                <h3 className={`font-medium mb-4 transition-all duration-300 ${
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
      
      {/* Floating Theme Toggle Button */}
      <div className="fixed bottom-14 right-6 z-50">
        <ThemeToggle size="medium" className="shadow-lg hover:shadow-xl" />
      </div>

      {/* Admin Panel Overlay */}
      <AdminPanel />
    </div>
    )
  }

  // Call the render function - NO CONDITIONAL RETURNS
  return renderContent()
}