'use client'

import React from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { useSession } from 'next-auth/react'
import {
  XMarkIcon,
  CogIcon,
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BellIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  SignalIcon,
} from '@heroicons/react/24/outline'
import ServiceTemplates from './admin/ServiceTemplates'
import ServiceGroups from './admin/ServiceGroups'
import BulkOperations from './admin/BulkOperations'
import IncidentManagement from './admin/IncidentManagement'
import MaintenanceWindows from './admin/MaintenanceWindows'
import ReportGeneration from './admin/ReportGeneration'
import NotificationRules from './admin/NotificationRules'
import UserAnalytics from './admin/UserAnalytics'
import SystemConfiguration from './admin/SystemConfiguration'
import RealTimeMonitor from './admin/RealTimeMonitor'

export default function AdminPanel() {
  const { isOpen, activeSection, setActiveSection, closePanel } = useAdmin()
  const { data: session } = useSession()

  // Only show to admin users
  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  if (!isOpen) {
    return null
  }

  const menuItems = [
    {
      category: 'Service Management',
      items: [
        { id: 'service-templates', label: 'Templates', icon: DocumentTextIcon },
        { id: 'service-groups', label: 'Groups', icon: ServerIcon },
        { id: 'bulk-operations', label: 'Bulk Operations', icon: CogIcon },
      ]
    },
    {
      category: 'Incident & Health',
      items: [
        { id: 'incidents', label: 'Active Incidents', icon: ExclamationTriangleIcon },
        { id: 'maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
      ]
    },
    {
      category: 'Analytics & Reports',
      items: [
        { id: 'reports', label: 'Generate Reports', icon: DocumentTextIcon },
      ]
    },
    {
      category: 'Notifications',
      items: [
        { id: 'notification-rules', label: 'Automation Rules', icon: BellIcon },
      ]
    },
    {
      category: 'User Management',
      items: [
        { id: 'user-analytics', label: 'Analytics', icon: ChartBarIcon },
      ]
    },
    {
      category: 'System Settings',
      items: [
        { id: 'system-config', label: 'Configuration', icon: CogIcon },
      ]
    },
    {
      category: 'Real-time Monitor',
      items: [
        { id: 'real-time-events', label: 'Live Events', icon: SignalIcon },
      ]
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'service-templates':
        return <ServiceTemplates />
      case 'service-groups':
        return <ServiceGroups />
      case 'bulk-operations':
        return <BulkOperations />
      case 'incidents':
        return <IncidentManagement />
      case 'maintenance':
        return <MaintenanceWindows />
      case 'reports':
        return <ReportGeneration />
      case 'notification-rules':
        return <NotificationRules />
      case 'user-analytics':
        return <UserAnalytics />
      case 'system-config':
        return <SystemConfiguration />
      case 'real-time-events':
        return <RealTimeMonitor />
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Control Panel
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a section from the sidebar to manage your system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.flatMap(category => category.items).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
                >
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🛠️ Admin Panel
          </h2>
          <button
            onClick={closePanel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {menuItems.map(category => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {category.category}
              </h3>
              <div className="space-y-1">
                {category.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}