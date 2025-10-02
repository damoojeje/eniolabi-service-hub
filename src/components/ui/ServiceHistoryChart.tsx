'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'

interface ServiceHistoryProps {
  serviceId: string
  serviceName: string
  timeRange?: '1h' | '24h' | '7d' | '30d'
}

export default function ServiceHistoryChart({ 
  serviceId, 
  serviceName, 
  timeRange = '24h' 
}: ServiceHistoryProps) {
  const [selectedRange, setSelectedRange] = useState(timeRange)

  const { data: historyData, isLoading } = trpc.services.getStatusHistory.useQuery({
    serviceId,
    timeRange: selectedRange
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500'
      case 'WARNING': return 'bg-yellow-500'
      case 'ERROR': return 'bg-red-500'
      case 'OFFLINE': return 'bg-gray-500'
      case 'TIMEOUT': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ONLINE': return '✅ Online'
      case 'WARNING': return '⚠️ Warning'
      case 'ERROR': return '❌ Error'
      case 'OFFLINE': return '🔴 Offline'
      case 'TIMEOUT': return '⏱️ Timeout'
      default: return '❓ Unknown'
    }
  }

  const calculateUptime = (history: any[]) => {
    if (!history || history.length === 0) return 0
    const onlineCount = history.filter(h => h.status === 'ONLINE').length
    return Math.round((onlineCount / history.length) * 100 * 100) / 100
  }

  const getAverageResponseTime = (history: any[]) => {
    if (!history || history.length === 0) return 0
    const validResponses = history.filter(h => h.responseTime && h.responseTime > 0)
    if (validResponses.length === 0) return 0
    const total = validResponses.reduce((sum, h) => sum + h.responseTime, 0)
    return Math.round(total / validResponses.length)
  }

  const getIncidentCount = (history: any[]) => {
    if (!history || history.length === 0) return 0
    let incidents = 0
    let wasOnline = true
    
    history.forEach(entry => {
      if (wasOnline && ['ERROR', 'OFFLINE', 'TIMEOUT'].includes(entry.status)) {
        incidents++
        wasOnline = false
      } else if (!wasOnline && entry.status === 'ONLINE') {
        wasOnline = true
      }
    })
    
    return incidents
  }

  const getDowntimeDuration = (history: any[]) => {
    if (!history || history.length === 0) return 0
    
    let totalDowntime = 0
    let currentDowntimeStart = null as Date | null
    
    // Sort by date ascending
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
    )
    
    sortedHistory.forEach((entry, index) => {
      const isDown = ['ERROR', 'OFFLINE', 'TIMEOUT'].includes(entry.status)
      
      if (isDown && !currentDowntimeStart) {
        currentDowntimeStart = new Date(entry.checkedAt)
      } else if (!isDown && currentDowntimeStart) {
        const downtime = new Date(entry.checkedAt).getTime() - currentDowntimeStart.getTime()
        totalDowntime += downtime
        currentDowntimeStart = null
      }
    })
    
    // If still down at the end
    if (currentDowntimeStart) {
      const lastEntry = sortedHistory[sortedHistory.length - 1]
      if (lastEntry) {
        const endTime = new Date(lastEntry.checkedAt).getTime()
        const startTime = currentDowntimeStart.getTime()
        const downtime = endTime - startTime
        totalDowntime += downtime
      }
    }
    
    return Math.round(totalDowntime / (1000 * 60)) // Convert to minutes
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.round(minutes / 60 * 10) / 10}h`
    return `${Math.round(minutes / 1440 * 10) / 10}d`
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {serviceName} - Status History
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No historical data available
        </div>
      </div>
    )
  }

  const uptime = calculateUptime(historyData)
  const avgResponseTime = getAverageResponseTime(historyData)
  const incidentCount = getIncidentCount(historyData)
  const downtimeDuration = getDowntimeDuration(historyData)
  const latestStatus = historyData[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {serviceName} - Status History
        </h3>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Current Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {getStatusLabel(latestStatus.status)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(latestStatus.checkedAt).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
          <div className={`text-2xl font-bold ${
            uptime >= 99.9 ? 'text-green-600 dark:text-green-400' :
            uptime >= 99 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {uptime}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last {selectedRange}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
          <div className={`text-2xl font-bold ${
            avgResponseTime <= 500 ? 'text-green-600 dark:text-green-400' :
            avgResponseTime <= 1000 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {avgResponseTime}ms
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last {selectedRange}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Incidents</div>
          <div className={`text-2xl font-bold ${
            incidentCount === 0 ? 'text-green-600 dark:text-green-400' :
            incidentCount <= 2 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {incidentCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last {selectedRange}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Downtime</div>
          <div className={`text-2xl font-bold ${
            downtimeDuration === 0 ? 'text-green-600 dark:text-green-400' :
            downtimeDuration <= 60 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {formatDuration(downtimeDuration)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last {selectedRange}
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Response Time Trend (Last 20 checks)
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-end space-x-1 h-20 overflow-x-auto">
            {historyData.slice(0, 20).reverse().map((entry, index) => {
              const maxResponseTime = Math.max(...historyData.slice(0, 20).map(e => e.responseTime || 0))
              const height = maxResponseTime > 0 ? Math.max((entry.responseTime || 0) / maxResponseTime * 60, 2) : 2
              
              return (
                <div
                  key={entry.id}
                  className="flex flex-col items-center"
                  title={`${entry.responseTime || 0}ms - ${new Date(entry.checkedAt).toLocaleString()}`}
                >
                  <div
                    className={`w-3 bg-blue-500 rounded-t transition-all hover:bg-blue-600 ${
                      entry.status !== 'ONLINE' ? 'bg-red-500 hover:bg-red-600' : ''
                    }`}
                    style={{ height: `${height}px` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>Oldest</span>
            <span>Most Recent</span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Status Timeline (Last 50 checks)
        </h4>
        <div className="flex flex-wrap gap-1">
          {historyData.slice(0, 50).reverse().map((entry, index) => (
            <div
              key={entry.id}
              className={`w-3 h-3 rounded-sm ${getStatusColor(entry.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
              title={`${getStatusLabel(entry.status)} - ${entry.responseTime}ms - ${new Date(entry.checkedAt).toLocaleString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Oldest</span>
          <span>Most Recent</span>
        </div>
      </div>

      {/* Service Health Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Status Changes */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Status Changes
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {historyData
              .filter((entry, index, arr) => 
                index === 0 || arr[index - 1].status !== entry.status
              )
              .slice(0, 10)
              .map((entry, index, filteredArray) => {
                const prevEntry = filteredArray[index + 1]
                let duration = null
                
                if (prevEntry) {
                  const durationMs = new Date(prevEntry.checkedAt).getTime() - new Date(entry.checkedAt).getTime()
                  duration = Math.round(durationMs / (1000 * 60)) // Convert to minutes
                }
                
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4"
                    style={{ borderLeftColor: getStatusColor(entry.status).includes('green') ? '#10b981' : 
                                              getStatusColor(entry.status).includes('yellow') ? '#f59e0b' :
                                              getStatusColor(entry.status).includes('red') ? '#ef4444' : '#6b7280' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status)}`} />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white block">
                          {getStatusLabel(entry.status)}
                        </span>
                        {duration && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {formatDuration(duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.checkedAt).toLocaleString()}
                      </div>
                      {entry.responseTime && (
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {entry.responseTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            
            {historyData.filter((entry, index, arr) => 
              index === 0 || arr[index - 1].status !== entry.status
            ).length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No status changes recorded
              </div>
            )}
          </div>
        </div>
        
        {/* Performance Insights */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Performance Insights
          </h4>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Health Score
                </span>
                <span className={`text-lg font-bold ${
                  uptime >= 99.9 ? 'text-green-600 dark:text-green-400' :
                  uptime >= 99 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {uptime >= 99.9 ? 'Excellent' : uptime >= 99 ? 'Good' : uptime >= 95 ? 'Fair' : 'Poor'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uptime >= 99.9 ? 'bg-green-500' :
                    uptime >= 99 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(uptime, 10)}%` }}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Key Metrics
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fastest Response:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(...historyData.filter(h => h.responseTime && h.responseTime > 0).map(h => h.responseTime || 0))}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Slowest Response:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.max(...historyData.filter(h => h.responseTime && h.responseTime > 0).map(h => h.responseTime || 0))}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Checks:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {historyData.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}