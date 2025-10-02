'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc'
import { useNotifications } from '@/contexts/NotificationContext'

interface Service {
  id: string
  name: string
  icon?: string
  currentStatus?: {
    status: 'ONLINE' | 'WARNING' | 'ERROR' | 'OFFLINE'
  }
  dependencies?: string[]
  dependents?: string[]
}

interface ServiceDependencyMapProps {
  isDarkMode: boolean
}

interface Node {
  id: string
  name: string
  icon: string
  status: string
  x: number
  y: number
  dependencies: string[]
  dependents: string[]
}

interface Connection {
  from: string
  to: string
}

export default function ServiceDependencyMap({ isDarkMode }: ServiceDependencyMapProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'dependencies' | 'dependents' | 'all'>('all')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { addToast } = useNotifications()

  const { data: services, isLoading } = trpc.services.getAll.useQuery()

  // Real dependency mapping based on service categories and infrastructure
  const getServiceDependencies = (service: any): string[] => {
    // Map real dependencies based on service categories
    const dependencies: string[] = []
    
    // Web services typically depend on databases
    if (['web', 'api', 'application'].includes(service.category?.toLowerCase())) {
      const dbServices = services?.filter((s: any) => s.category?.toLowerCase() === 'database') || []
      if (dbServices?.length > 0) {
        dependencies.push(...dbServices.map((s: any) => s.id))
      }
    }
    
    return dependencies
  }

  const getServiceNodes = (): Node[] => {
    if (!services || !Array.isArray(services)) return []

    return services.map((service: any, index: number) => ({
      id: service.id,
      name: service.name,
      icon: service.icon || '🔧',
      status: service.currentStatus?.status || 'OFFLINE',
      x: 100 + (index % 4) * 200,
      y: 100 + Math.floor(index / 4) * 150,
      dependencies: getServiceDependencies(service),
      dependents: services?.filter((s: any) => getServiceDependencies(s).includes(service.id)).map((s: any) => s.id) || []
    }))
  }

  const getConnections = (nodes: Node[]): Connection[] => {
    const connections: Connection[] = []
    
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        if (nodes.find(n => n.id === depId)) {
          connections.push({ from: depId, to: node.id })
        }
      })
    })
    
    return connections
  }

  const getStatusColor = (status: string, alpha = 1) => {
    switch (status) {
      case 'ONLINE': return `rgba(34, 197, 94, ${alpha})`
      case 'WARNING': return `rgba(251, 191, 36, ${alpha})`
      case 'ERROR': return `rgba(239, 68, 68, ${alpha})`
      case 'OFFLINE': return `rgba(107, 114, 128, ${alpha})`
      default: return `rgba(107, 114, 128, ${alpha})`
    }
  }

  const drawDependencyMap = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nodes = getServiceNodes()
    const connections = getConnections(nodes)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas background
    ctx.fillStyle = isDarkMode ? '#111827' : '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Filter connections based on view mode and selected service
    const filteredConnections = connections.filter(conn => {
      if (selectedService) {
        switch (viewMode) {
          case 'dependencies':
            return conn.to === selectedService
          case 'dependents':
            return conn.from === selectedService
          case 'all':
            return conn.from === selectedService || conn.to === selectedService
        }
      }
      return true
    })

    // Draw connections
    filteredConnections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from)
      const toNode = nodes.find(n => n.id === conn.to)
      
      if (fromNode && toNode) {
        ctx.strokeStyle = isDarkMode ? '#6b7280' : '#9ca3af'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        
        // Draw arrow
        ctx.beginPath()
        ctx.moveTo(fromNode.x + 30, fromNode.y + 30)
        ctx.lineTo(toNode.x + 30, toNode.y + 30)
        ctx.stroke()
        
        // Draw arrowhead
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)
        const headlen = 10
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(toNode.x + 30, toNode.y + 30)
        ctx.lineTo(toNode.x + 30 - headlen * Math.cos(angle - Math.PI / 6), toNode.y + 30 - headlen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(toNode.x + 30, toNode.y + 30)
        ctx.lineTo(toNode.x + 30 - headlen * Math.cos(angle + Math.PI / 6), toNode.y + 30 - headlen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const isHighlighted = selectedService === node.id
      const opacity = selectedService && !isHighlighted && viewMode !== 'all' ? 0.3 : 1

      // Draw node circle
      ctx.fillStyle = getStatusColor(node.status, opacity)
      ctx.beginPath()
      ctx.arc(node.x + 30, node.y + 30, 25, 0, 2 * Math.PI)
      ctx.fill()

      // Draw node border
      ctx.strokeStyle = isHighlighted ? '#3b82f6' : (isDarkMode ? '#374151' : '#d1d5db')
      ctx.lineWidth = isHighlighted ? 3 : 2
      ctx.stroke()

      // Draw icon
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(node.icon, node.x + 30, node.y + 37)

      // Draw label
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#111827'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      const text = node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name
      ctx.fillText(text, node.x + 30, node.y + 70, opacity)
    })
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const nodes = getServiceNodes()
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - (node.x + 30)) ** 2 + (y - (node.y + 30)) ** 2)
      return distance <= 25
    })

    if (clickedNode) {
      setSelectedService(selectedService === clickedNode.id ? null : clickedNode.id)
      addToast({
        type: 'info',
        title: `Service ${selectedService === clickedNode.id ? 'deselected' : 'selected'}`,
        message: selectedService === clickedNode.id ? '' : `Viewing dependencies for ${clickedNode.name}`,
        duration: 3000
      })
    }
  }

  useEffect(() => {
    drawDependencyMap()
  }, [services, selectedService, viewMode, isDarkMode])

  if (isLoading) {
    return (
      <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const nodes = getServiceNodes()
  const selectedNode = nodes.find(n => n.id === selectedService)

  return (
    <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Service Dependency Map
        </h3>
        
        <div className="flex items-center space-x-4">
          {selectedService && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                View:
              </span>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className={`text-sm rounded border px-2 py-1 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Connections</option>
                <option value="dependencies">Dependencies Only</option>
                <option value="dependents">Dependents Only</option>
              </select>
            </div>
          )}
          
          <button
            onClick={() => setSelectedService(null)}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="mb-4 border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onClick={handleCanvasClick}
          className="cursor-pointer w-full h-auto"
        />
      </div>

      {/* Legend and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Legend */}
        <div>
          <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Status Legend
          </h4>
          <div className="space-y-2">
            {[
              { status: 'ONLINE', label: 'Online', color: 'bg-green-500' },
              { status: 'WARNING', label: 'Warning', color: 'bg-yellow-500' },
              { status: 'ERROR', label: 'Error', color: 'bg-red-500' },
              { status: 'OFFLINE', label: 'Offline', color: 'bg-gray-500' }
            ].map(({ status, label, color }) => (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${color}`}></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedNode && (
          <div>
            <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedNode.name} Details
            </h4>
            <div className="space-y-3">
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Status:
                </span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNode.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                  selectedNode.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedNode.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dependencies: {selectedNode.dependencies.length}
                </span>
                {selectedNode.dependencies.length > 0 && (
                  <div className="mt-1 text-xs">
                    {selectedNode.dependencies.map(depId => {
                      const depNode = nodes.find(n => n.id === depId)
                      return depNode ? depNode.name : depId
                    }).join(', ')}
                  </div>
                )}
              </div>
              
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Dependents: {selectedNode.dependents.length}
                </span>
                {selectedNode.dependents.length > 0 && (
                  <div className="mt-1 text-xs">
                    {selectedNode.dependents.map(depId => {
                      const depNode = nodes.find(n => n.id === depId)
                      return depNode ? depNode.name : depId
                    }).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className={`mt-4 p-3 rounded-lg text-sm ${
        isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
      }`}>
        💡 <strong>Tip:</strong> Click on any service node to view its dependencies and dependents. 
        Use the view mode selector to filter connections.
      </div>
    </div>
  )
}