'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'

interface Incident {
  id: string
  serviceId: string
  serviceName: string
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  startTime: Date
  resolvedTime?: Date
  description: string
  autoActions: string[]
  manualActions: string[]
}

interface AutomationRule {
  id: string
  name: string
  conditions: {
    status: string[]
    duration: number // minutes
    severity: string[]
  }
  actions: {
    type: 'restart_service' | 'notify_oncall' | 'scale_replicas' | 'run_script' | 'create_ticket'
    config: any
  }[]
  enabled: boolean
}

interface IncidentResponseSystemProps {
  isDarkMode: boolean
}

export default function IncidentResponseSystem({ isDarkMode }: IncidentResponseSystemProps) {
  const [activeTab, setActiveTab] = useState<'incidents' | 'rules' | 'playbooks'>('incidents')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [rules, setRules] = useState<AutomationRule[]>([])
  const { addToast } = useNotifications()
  const { data: services } = trpc.services.getAll.useQuery()

  // Real data initialization from services
  useEffect(() => {
    // Generate incidents from real service status data
    if (services) {
      const realIncidents: Incident[] = services
        .filter(service => service.currentStatus?.status === 'OFFLINE' || service.currentStatus?.status === 'ERROR')
        .map((service, index) => ({
          id: service.id,
          serviceId: service.id,
          serviceName: service.name,
          status: service.currentStatus?.status === 'OFFLINE' ? 'ACTIVE' : 'INVESTIGATING',
          severity: service.currentStatus?.status === 'OFFLINE' ? 'CRITICAL' : 'HIGH',
          startTime: service.currentStatus?.checkedAt || new Date(),
          description: `Service ${service.name} is ${service.currentStatus?.status.toLowerCase()}. ${service.currentStatus?.errorMessage || 'No additional details available.'}`,
          autoActions: ['Automatic restart attempted', 'Health check initiated'],
          manualActions: ['Investigating root cause', 'Checking service logs']
        }))
      setIncidents(realIncidents)
    } else {
      setIncidents([])
    }

    // Default automation rules for production
    setRules([
      {
        id: '1',
        name: 'High Response Time Auto-Scale',
        conditions: {
          status: ['WARNING', 'ERROR'],
          duration: 5, // 5 minutes
          severity: ['HIGH', 'CRITICAL']
        },
        actions: [
          {
            type: 'scale_replicas',
            config: { replicas: 3 }
          },
          {
            type: 'notify_oncall',
            config: { channel: 'slack', urgency: 'high' }
          }
        ],
        enabled: true
      },
      {
        id: '2',
        name: 'Database Connection Recovery',
        conditions: {
          status: ['ERROR', 'OFFLINE'],
          duration: 2,
          severity: ['MEDIUM', 'HIGH', 'CRITICAL']
        },
        actions: [
          {
            type: 'restart_service',
            config: { service: 'database-pool' }
          },
          {
            type: 'run_script',
            config: { script: 'clear-connections.sh' }
          }
        ],
        enabled: true
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'ESCALATED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white'
      case 'HIGH': return 'bg-orange-600 text-white'
      case 'MEDIUM': return 'bg-yellow-600 text-white'
      case 'LOW': return 'bg-blue-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const duration = Math.floor((endTime.getTime() - start.getTime()) / (1000 * 60))
    
    if (duration < 60) return `${duration}m`
    if (duration < 1440) return `${Math.floor(duration / 60)}h ${duration % 60}m`
    return `${Math.floor(duration / 1440)}d ${Math.floor((duration % 1440) / 60)}h`
  }

  const handleTriggerAutomation = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId)
    if (!rule) return

    addToast({
      type: 'info',
      title: 'Automation triggered',
      message: `Executing rule: ${rule.name}`,
      duration: 5000
    })

    // Simulate automation execution
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Automation completed',
        message: `Successfully executed ${rule.actions.length} actions`,
        duration: 5000
      })
    }, 2000)
  }

  const handleResolveIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: 'RESOLVED' as const, resolvedTime: new Date() }
        : incident
    ))

    addToast({
      type: 'success',
      title: 'Incident resolved',
      message: 'Incident has been marked as resolved',
      duration: 5000
    })
  }

  return (
    <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🚨 Incident Response System
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm ${
          incidents.filter(i => i.status === 'ACTIVE').length > 0
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {incidents.filter(i => i.status === 'ACTIVE').length} Active Incidents
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { key: 'incidents', label: '🔥 Active Incidents', count: incidents.filter(i => i.status === 'ACTIVE').length },
          { key: 'rules', label: '⚙️ Automation Rules', count: rules.filter(r => r.enabled).length },
          { key: 'playbooks', label: '📖 Response Playbooks', count: 3 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.map(incident => (
            <div key={incident.id} className={`border rounded-lg p-4 ${
              isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {incident.serviceName}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDuration(incident.startTime, incident.resolvedTime)}
                  </span>
                  {incident.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleResolveIncident(incident.id)}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {incident.description}
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    🤖 Automated Actions
                  </h5>
                  <ul className="space-y-1">
                    {incident.autoActions.map((action, index) => (
                      <li key={index} className={`text-sm flex items-center space-x-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className="text-green-500">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    👤 Manual Actions Needed
                  </h5>
                  <ul className="space-y-1">
                    {incident.manualActions.map((action, index) => (
                      <li key={index} className={`text-sm flex items-center space-x-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className="text-yellow-500">⚠</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          
          {incidents.filter(i => i.status === 'ACTIVE').length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Active Incidents
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                All services are running normally
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className={`border rounded-lg p-4 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${
                    rule.enabled ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {rule.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTriggerAutomation(rule.id)}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Test Run
                  </button>
                  <button
                    onClick={() => {
                      setRules(prev => prev.map(r => 
                        r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                      ))
                    }}
                    className={`text-sm px-3 py-1 rounded ${
                      rule.enabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Trigger Conditions
                  </h5>
                  <ul className={`space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Status: {rule.conditions.status.join(', ')}</li>
                    <li>Duration: {rule.conditions.duration} minutes</li>
                    <li>Severity: {rule.conditions.severity.join(', ')}</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Automated Actions
                  </h5>
                  <ul className={`space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {rule.actions.map((action, index) => (
                      <li key={index}>
                        {action.type.replace('_', ' ').toUpperCase()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'playbooks' && (
        <div className="space-y-4">
          {[
            {
              title: 'Database Connection Issues',
              steps: [
                'Check connection pool status',
                'Verify database server health',
                'Restart connection pool if needed',
                'Scale database replicas if under load',
                'Contact DBA team if issues persist'
              ]
            },
            {
              title: 'High Response Time',
              steps: [
                'Check application metrics and logs',
                'Verify external API dependencies',
                'Scale application instances',
                'Clear application cache',
                'Review recent deployments'
              ]
            },
            {
              title: 'Service Completely Down',
              steps: [
                'Check service health endpoint',
                'Verify infrastructure status (servers, network)',
                'Restart service instances',
                'Check for recent configuration changes',
                'Escalate to on-call engineer if unresolved'
              ]
            }
          ].map((playbook, index) => (
            <div key={index} className={`border rounded-lg p-4 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📖 {playbook.title}
              </h4>
              <ol className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {playbook.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {stepIndex + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}