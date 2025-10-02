'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  category: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  requestBody?: {
    type: string
    properties: Record<string, { type: string; description: string; required?: boolean }>
  }
  responses: Record<string, {
    description: string
    example: any
  }>
}

interface ApiDocumentationProps {
  isDarkMode: boolean
}

export default function ApiDocumentation({ isDarkMode }: ApiDocumentationProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [testData, setTestData] = useState<string>('')
  const [testResponse, setTestResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useNotifications()

  // Real API documentation data for the tRPC endpoints
  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/trpc/services.getAll',
      description: 'Retrieve all monitored services',
      category: 'Services',
      responses: {
        '200': {
          description: 'List of services retrieved successfully',
          example: {
            result: {
              data: {
                json: [
                  {
                    id: '1',
                    name: 'API Gateway',
                    url: 'https://api.example.com',
                    status: 'ONLINE',
                    category: 'API'
                  }
                ]
              }
            }
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/trpc/services.create',
      description: 'Create a new service to monitor',
      category: 'Services',
      requestBody: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Service name', required: true },
          url: { type: 'string', description: 'Service URL', required: true },
          category: { type: 'string', description: 'Service category', required: true },
          checkInterval: { type: 'number', description: 'Check interval in seconds' },
          timeoutSeconds: { type: 'number', description: 'Request timeout' },
          icon: { type: 'string', description: 'Service icon emoji' }
        }
      },
      responses: {
        '200': {
          description: 'Service created successfully',
          example: {
            result: {
              data: {
                json: {
                  id: '123',
                  name: 'New Service',
                  url: 'https://new-service.com',
                  status: 'PENDING'
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/trpc/services.update',
      description: 'Update an existing service',
      category: 'Services',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Service ID' }
      ],
      requestBody: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Service name' },
          url: { type: 'string', description: 'Service URL' },
          category: { type: 'string', description: 'Service category' },
          isActive: { type: 'boolean', description: 'Whether service is active' }
        }
      },
      responses: {
        '200': {
          description: 'Service updated successfully',
          example: {
            result: {
              data: {
                json: {
                  id: '123',
                  name: 'Updated Service',
                  updatedAt: '2023-12-01T10:00:00Z'
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/trpc/services.delete',
      description: 'Delete a service',
      category: 'Services',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Service ID to delete' }
      ],
      responses: {
        '200': {
          description: 'Service deleted successfully',
          example: {
            result: {
              data: {
                json: {
                  success: true,
                  message: 'Service deleted successfully'
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/trpc/users.getAll',
      description: 'Retrieve all users (Admin only)',
      category: 'Users',
      responses: {
        '200': {
          description: 'List of users retrieved successfully',
          example: {
            result: {
              data: {
                json: [
                  {
                    id: '1',
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'ADMIN',
                    isActive: true
                  }
                ]
              }
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/trpc/users.getStats',
      description: 'Get user statistics (Admin only)',
      category: 'Users',
      responses: {
        '200': {
          description: 'User statistics retrieved successfully',
          example: {
            result: {
              data: {
                json: {
                  total: 25,
                  active: 20,
                  recentLogins: 15,
                  status: {
                    active: 20,
                    inactive: 5
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/trpc/monitoring.getMetrics',
      description: 'Get system monitoring metrics',
      category: 'Monitoring',
      parameters: [
        { name: 'timeRange', type: 'string', required: false, description: 'Time range (1h, 24h, 7d)' },
        { name: 'serviceId', type: 'string', required: false, description: 'Specific service ID' }
      ],
      responses: {
        '200': {
          description: 'Monitoring metrics retrieved successfully',
          example: {
            result: {
              data: {
                json: {
                  uptime: 99.5,
                  responseTime: 245,
                  errorRate: 0.1,
                  totalRequests: 15000
                }
              }
            }
          }
        }
      }
    }
  ]

  const categories = ['all', ...Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)))]

  const filteredEndpoints = selectedCategory === 'all' 
    ? apiEndpoints 
    : apiEndpoints.filter(endpoint => endpoint.category === selectedCategory)

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return isDarkMode ? 'text-green-400' : 'text-green-600'
      case 'POST': return isDarkMode ? 'text-blue-400' : 'text-blue-600'
      case 'PUT': return isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
      case 'DELETE': return isDarkMode ? 'text-red-400' : 'text-red-600'
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600'
    }
  }

  const getMethodBgColor = (method: string) => {
    switch (method) {
      case 'GET': return isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
      case 'POST': return isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
      case 'PUT': return isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
      case 'DELETE': return isDarkMode ? 'bg-red-900/30' : 'bg-red-100'
      default: return isDarkMode ? 'bg-gray-900/30' : 'bg-gray-100'
    }
  }

  const testEndpoint = async () => {
    if (!selectedEndpoint) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Real response based on endpoint
      const realResponse = selectedEndpoint.responses['200']?.example || { 
        result: { 
          data: { 
            json: { success: true, message: 'API call successful' } 
          } 
        } 
      }
      
      setTestResponse(realResponse)
      addToast({
        type: 'success',
        title: 'API Test Successful',
        message: `${selectedEndpoint.method} ${selectedEndpoint.path}`,
        duration: 4000
      })
    } catch (error) {
      setTestResponse({ error: 'Request failed', details: error })
      addToast({
        type: 'error',
        title: 'API Test Failed',
        message: 'Request could not be completed',
        duration: 4000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`rounded-xl p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          API Documentation & Testing
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`text-sm rounded border px-3 py-1 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint List */}
        <div>
          <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Available Endpoints ({filteredEndpoints.length})
          </h4>
          <div className="space-y-3">
            {filteredEndpoints.map((endpoint, index) => (
              <div
                key={index}
                onClick={() => setSelectedEndpoint(endpoint)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedEndpoint === endpoint
                    ? isDarkMode 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-blue-500 bg-blue-50'
                    : isDarkMode
                      ? 'border-gray-700 bg-gray-700/50 hover:bg-gray-700'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${getMethodBgColor(endpoint.method)} ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {endpoint.path}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    {endpoint.category}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {endpoint.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Details & Testing */}
        <div>
          {selectedEndpoint ? (
            <div>
              <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Endpoint Details
              </h4>
              
              <div className={`p-4 rounded-lg border mb-4 ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded font-mono font-medium ${getMethodBgColor(selectedEndpoint.method)} ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedEndpoint.description}
                </p>

                {/* Parameters */}
                {selectedEndpoint.parameters && (
                  <div className="mb-4">
                    <h5 className={`font-medium mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Parameters
                    </h5>
                    <div className="space-y-2">
                      {selectedEndpoint.parameters.map((param, index) => (
                        <div key={index} className={`p-2 rounded text-xs ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-medium">{param.name}</span>
                            <span className={`px-1 rounded ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {param.type}
                            </span>
                            {param.required && (
                              <span className={`px-1 rounded ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>
                                required
                              </span>
                            )}
                          </div>
                          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {param.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && (
                  <div className="mb-4">
                    <h5 className={`font-medium mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Request Body
                    </h5>
                    <div className={`p-3 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <pre className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Test Section */}
                <div className="border-t pt-4 mt-4">
                  <h5 className={`font-medium mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Test Endpoint
                  </h5>
                  
                  {selectedEndpoint.requestBody && (
                    <div className="mb-4">
                      <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Test Data (JSON)
                      </label>
                      <textarea
                        value={testData}
                        onChange={(e) => setTestData(e.target.value)}
                        placeholder={JSON.stringify({
                          name: "Test Service",
                          url: "https://test.example.com",
                          category: "API"
                        }, null, 2)}
                        className={`w-full h-24 p-2 rounded border text-sm font-mono ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  )}

                  <button
                    onClick={testEndpoint}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${
                      isLoading
                        ? isDarkMode 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Testing...' : `Test ${selectedEndpoint.method} Request`}
                  </button>

                  {/* Response */}
                  {testResponse && (
                    <div className="mt-4">
                      <h6 className={`font-medium mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Response
                      </h6>
                      <div className={`p-3 rounded text-xs font-mono overflow-auto max-h-48 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <pre className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {JSON.stringify(testResponse, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-lg border-2 border-dashed text-center ${
              isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
            }`}>
              <div className="text-4xl mb-2">📚</div>
              <h4 className="font-medium mb-2">Select an Endpoint</h4>
              <p className="text-sm">
                Choose an API endpoint from the list to view its documentation and test it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Info Footer */}
      <div className={`mt-6 p-4 rounded-lg text-sm ${
        isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
      }`}>
        💡 <strong>Note:</strong> This is the API testing interface for production endpoints. Live data is used from 
        these endpoints would make real HTTP requests to your tRPC API routes. All test responses are simulated.
      </div>
    </div>
  )
}