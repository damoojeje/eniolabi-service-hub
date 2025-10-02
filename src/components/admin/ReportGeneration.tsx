'use client'

import React, { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface ReportConfig {
  title: string
  type: 'SYSTEM_OVERVIEW' | 'SERVICE_ANALYTICS' | 'USER_ACTIVITY' | 'INCIDENT_REPORT'
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | '90d'
  format: 'PDF' | 'CSV' | 'JSON'
  includeCharts: boolean
  includeDetails: boolean
  serviceIds?: string[]
  categories?: string[]
}

export default function ReportGeneration() {
  const { addToast } = useNotifications()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    title: '',
    type: 'SYSTEM_OVERVIEW',
    timeRange: '24h',
    format: 'PDF',
    includeCharts: true,
    includeDetails: true,
    serviceIds: [],
    categories: []
  })

  const { data: systemOverview, isLoading: overviewLoading } = trpc.analytics.getSystemOverview.useQuery({
    timeRange: reportConfig.timeRange
  })
  const { data: services } = trpc.services.getAll.useQuery()

  const generateReportMutation = trpc.analytics.generateReport.useMutation({
    onSuccess: (data) => {
      addToast({
        type: 'success',
        title: 'Report Generated',
        message: 'Report has been generated successfully'
      })
      setIsGenerating(false)
      // Here you would typically trigger a download
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      }
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message
      })
      setIsGenerating(false)
    }
  })

  const handleGenerateReport = () => {
    if (!reportConfig.title) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Report title is required'
      })
      return
    }

    // Transform the config to match the API expectations
    const apiConfig = {
      name: reportConfig.title,
      description: `Generated report for ${reportConfig.type}`,
      reportType: reportConfig.type === 'SYSTEM_OVERVIEW' ? 'SYSTEM' as const :
                  reportConfig.type === 'SERVICE_ANALYTICS' ? 'SERVICE' as const :
                  reportConfig.type === 'USER_ACTIVITY' ? 'SYSTEM' as const :
                  'SYSTEM' as const,
      timeRange: reportConfig.timeRange,
      services: reportConfig.serviceIds || [],
      metrics: ['uptime', 'response_time', 'status_distribution', 'availability', 'error_rate'] as const,
      format: reportConfig.format
    }

    setIsGenerating(true)
    generateReportMutation.mutate(apiConfig)
  }

  const getQuickReportConfig = (type: ReportConfig['type'], timeRange: ReportConfig['timeRange']) => {
    const configs = {
      'SYSTEM_OVERVIEW': {
        title: `System Overview - ${timeRange}`,
        description: 'Complete system health and performance metrics',
        icon: <ChartBarIcon className="w-8 h-8 text-blue-500" />
      },
      'SERVICE_ANALYTICS': {
        title: `Service Analytics - ${timeRange}`,
        description: 'Detailed service performance and uptime statistics',
        icon: <DocumentTextIcon className="w-8 h-8 text-green-500" />
      },
      'USER_ACTIVITY': {
        title: `User Activity - ${timeRange}`,
        description: 'User engagement and system usage patterns',
        icon: <ClockIcon className="w-8 h-8 text-purple-500" />
      },
      'INCIDENT_REPORT': {
        title: `Incident Report - ${timeRange}`,
        description: 'Summary of incidents and system issues',
        icon: <DocumentArrowDownIcon className="w-8 h-8 text-red-500" />
      }
    }
    return configs[type]
  }

  const formatTimeRange = (range: string) => {
    const labels = {
      '1h': 'Last Hour',
      '6h': 'Last 6 Hours',
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days'
    }
    return labels[range as keyof typeof labels] || range
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Report Generation
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive system reports
          </p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Custom Report</span>
        </button>
      </div>

      {/* System Overview Cards */}
      {systemOverview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemOverview.servicesCount || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Services</div>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((systemOverview.uptime || 0) * 100)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">System Uptime</div>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {systemOverview.averageResponseTime || 0}ms
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Response</div>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {systemOverview.totalIncidents || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Incidents</div>
              </div>
              <DocumentArrowDownIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {(['SYSTEM_OVERVIEW', 'SERVICE_ANALYTICS', 'USER_ACTIVITY', 'INCIDENT_REPORT'] as const).map(type => {
          const config = getQuickReportConfig(type, reportConfig.timeRange)
          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {config.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {config.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatTimeRange(reportConfig.timeRange)}</span>
                </div>
                <button
                  onClick={() => {
                    setReportConfig({
                      ...reportConfig,
                      title: config.title,
                      type: type
                    })
                    handleGenerateReport()
                  }}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center space-x-1"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Report History
        </h3>
        <div className="text-center py-8">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Generated reports will appear here
          </p>
        </div>
      </div>

      {/* Custom Report Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configure Custom Report
                </h3>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    value={reportConfig.title}
                    onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter report title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Report Type
                    </label>
                    <select
                      value={reportConfig.type}
                      onChange={(e) => setReportConfig({...reportConfig, type: e.target.value as ReportConfig['type']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="SYSTEM_OVERVIEW">System Overview</option>
                      <option value="SERVICE_ANALYTICS">Service Analytics</option>
                      <option value="USER_ACTIVITY">User Activity</option>
                      <option value="INCIDENT_REPORT">Incident Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Range
                    </label>
                    <select
                      value={reportConfig.timeRange}
                      onChange={(e) => setReportConfig({...reportConfig, timeRange: e.target.value as ReportConfig['timeRange']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="1h">Last Hour</option>
                      <option value="6h">Last 6 Hours</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <select
                    value={reportConfig.format}
                    onChange={(e) => setReportConfig({...reportConfig, format: e.target.value as ReportConfig['format']})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={reportConfig.includeCharts}
                      onChange={(e) => setReportConfig({...reportConfig, includeCharts: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeCharts" className="ml-2 text-sm text-gray-900 dark:text-white">
                      Include Charts
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeDetails"
                      checked={reportConfig.includeDetails}
                      onChange={(e) => setReportConfig({...reportConfig, includeDetails: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeDetails" className="ml-2 text-sm text-gray-900 dark:text-white">
                      Include Details
                    </label>
                  </div>
                </div>

                {services && reportConfig.type === 'SERVICE_ANALYTICS' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Services (Optional)
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                      {services.slice(0, 5).map((service: any) => (
                        <label key={service.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={reportConfig.serviceIds?.includes(service.id) || false}
                            onChange={(e) => {
                              const serviceIds = reportConfig.serviceIds || []
                              if (e.target.checked) {
                                setReportConfig({
                                  ...reportConfig,
                                  serviceIds: [...serviceIds, service.id]
                                })
                              } else {
                                setReportConfig({
                                  ...reportConfig,
                                  serviceIds: serviceIds.filter(id => id !== service.id)
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
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfig(false)
                    handleGenerateReport()
                  }}
                  disabled={isGenerating || !reportConfig.title}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}