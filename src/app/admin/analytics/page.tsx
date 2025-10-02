'use client'

/**
 * Analytics Dashboard Page
 * Comprehensive analytics interface with real charts and metrics
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  ServerIcon, 
  CpuChipIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface MetricCard {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ComponentType<any>
  color?: string
}

function MetricCard({ title, value, subtitle, trend, icon: Icon, color = 'blue' }: MetricCard) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  }

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50'
  }

  return (
    <div className={`p-6 rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} dark:bg-gray-800 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-gray-500 dark:text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  )
}

function UptimeChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Uptime Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="uptime" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ResponseTimeChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Time Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="responseTime" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatusDistributionChart({ data }: { data: any[] }) {
  const COLORS = {
    ONLINE: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    OFFLINE: '#6b7280'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h')

  // Fetch analytics data using the actual available endpoints
  const { data: systemOverview, isLoading: loadingOverview } = trpc.analytics.getSystemOverview.useQuery({})
  const { data: serviceMetrics, isLoading: loadingServices } = trpc.analytics.getServiceMetrics.useQuery({
    timeRange: timeRange
  })
  const { data: alertsOverview, isLoading: loadingAlerts } = trpc.analytics.getAlertsOverview.useQuery({
    timeRange: timeRange
  })
  const { data: timeSeriesData, isLoading: loadingTimeSeries } = trpc.analytics.getTimeSeriesData.useQuery({
    timeRange: timeRange,
    metrics: ['uptime', 'response_time', 'status_distribution']
  })
  const { data: serviceHealthMetrics, isLoading: loadingHealth } = trpc.analytics.getServiceHealthMetrics.useQuery({
    timeRange: timeRange
  })

  const isLoading = loadingOverview || loadingServices || loadingAlerts || loadingTimeSeries || loadingHealth

  // Transform data for charts
  const uptimeChartData = timeSeriesData?.uptime || []
  const responseTimeChartData = timeSeriesData?.response_time || []
  
  const statusDistributionData = systemOverview ? [
    { name: 'ONLINE', value: systemOverview.onlineServices },
    { name: 'WARNING', value: systemOverview.warningServices },
    { name: 'ERROR', value: systemOverview.errorServices },
    { name: 'OFFLINE', value: systemOverview.offlineServices }
  ].filter(item => item.value > 0) : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Admin
              </Link>
              <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive system metrics and insights</p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Services"
            value={systemOverview?.totalServices || 0}
            subtitle={`${systemOverview?.onlineServices || 0} healthy`}
            trend="stable"
            icon={ServerIcon}
            color="blue"
          />
          <MetricCard
            title="Overall Uptime"
            value={`${systemOverview?.avgUptime?.toFixed(1) || 0}%`}
            subtitle="Last 24 hours"
            trend={systemOverview?.avgUptime && systemOverview.avgUptime > 95 ? 'up' : 'down'}
            icon={CheckCircleIcon}
            color="green"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${systemOverview?.avgResponseTime || 0}ms`}
            subtitle="Across all services"
            trend="stable"
            icon={ClockIcon}
            color="blue"
          />
          <MetricCard
            title="Active Alerts"
            value={alertsOverview?.total || 0}
            subtitle={`${alertsOverview?.active || 0} critical`}
            trend={alertsOverview?.total && alertsOverview.total > 0 ? 'down' : 'stable'}
            icon={ExclamationTriangleIcon}
            color={alertsOverview?.total && alertsOverview.total > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UptimeChart data={uptimeChartData} />
          <ResponseTimeChart data={responseTimeChartData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatusDistributionChart data={statusDistributionData} />
          
          {/* Service Health Scores */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Health Scores</h3>
            <div className="space-y-4">
              {serviceHealthMetrics?.slice(0, 5).map((service: any, index: number) => (
                <div key={service.serviceId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{service.serviceName}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          service.healthScore >= 95 ? 'bg-green-500' : 
                          service.healthScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${service.healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {service.healthScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Performance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Response
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Health Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {serviceMetrics?.map((service: any, index: number) => (
                  <tr key={service.serviceId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{service.serviceName}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{service.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.currentStatus === 'ONLINE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        service.currentStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {service.currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {service.uptime}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {service.avgResponseTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              service.healthScore >= 95 ? 'bg-green-500' : 
                              service.healthScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${service.healthScore}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900 dark:text-white">{service.healthScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}