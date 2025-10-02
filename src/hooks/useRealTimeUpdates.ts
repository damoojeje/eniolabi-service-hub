import { useEffect, useRef, useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'

interface RealTimeEvent {
  type: 'connected' | 'service_status_update' | 'health_check_triggered' | 'user_activity' | 'heartbeat' | 'error'
  data?: any
  message?: string
  timestamp: string
}

interface UseRealTimeUpdatesOptions {
  onServiceStatusUpdate?: (data: any) => void
  onHealthCheckTriggered?: (data: any) => void
  onUserActivity?: (data: any) => void
  onConnected?: () => void
  onError?: (error: string) => void
}

export function useRealTimeUpdates({
  onServiceStatusUpdate,
  onHealthCheckTriggered,
  onUserActivity,
  onConnected,
  onError,
}: UseRealTimeUpdatesOptions = {}) {
  const { data: session } = useSession()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10 // Increase max attempts
  const baseReconnectDelay = 1000 // 1 second base delay
  const maxReconnectDelay = 30000 // 30 seconds max delay
  const [isClient, setIsClient] = useState(false)

  // Store callbacks in refs to prevent dependency updates
  const callbacksRef = useRef({
    onServiceStatusUpdate,
    onHealthCheckTriggered, 
    onUserActivity,
    onConnected,
    onError
  })

  // Update callback refs without causing reconnections
  callbacksRef.current = {
    onServiceStatusUpdate,
    onHealthCheckTriggered,
    onUserActivity,
    onConnected,
    onError
  }

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const connect = useCallback(() => {
    if (!session?.user || !isClient) {
      console.log('No session or not client, skipping SSE connection')
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('Establishing SSE connection...')
    const eventSource = new EventSource('/api/events')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('✅ SSE connection established')
      reconnectAttempts.current = 0
    }

    eventSource.onmessage = (event) => {
      try {
        const eventData: RealTimeEvent = JSON.parse(event.data)
        
        switch (eventData.type) {
          case 'connected':
            console.log('📡 SSE connected:', eventData.message)
            callbacksRef.current.onConnected?.()
            break
            
          case 'service_status_update':
            console.log('🔄 Service status update:', eventData.data)
            callbacksRef.current.onServiceStatusUpdate?.(eventData.data)
            break
            
          case 'health_check_triggered':
            console.log('🏥 Health check triggered:', eventData.data)
            callbacksRef.current.onHealthCheckTriggered?.(eventData.data)
            break
            
          case 'user_activity':
            console.log('👤 User activity:', eventData.data)
            callbacksRef.current.onUserActivity?.(eventData.data)
            break
            
          case 'heartbeat':
            // Silent heartbeat - just keep connection alive
            break
            
          case 'error':
            console.error('❌ SSE error:', eventData.message)
            onError?.(eventData.message || 'Unknown SSE error')
            break
            
          default:
            console.log('Unknown SSE event type:', eventData.type)
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
        onError?.('Error parsing real-time update')
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error)
      eventSource.close()
      
      // Attempt to reconnect with improved exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        // Calculate delay with jitter to prevent thundering herd
        const exponentialDelay = Math.min(
          Math.pow(2, reconnectAttempts.current) * baseReconnectDelay,
          maxReconnectDelay
        )
        const jitter = Math.random() * 0.3 // Add up to 30% random jitter
        const delay = Math.floor(exponentialDelay * (1 + jitter))
        
        console.log(`🔄 Attempting to reconnect SSE in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++
          connect()
        }, delay)
      } else {
        console.error('❌ Max reconnection attempts reached. SSE connection failed.')
        callbacksRef.current.onError?.('Real-time updates connection failed. Please refresh the page.')
      }
    }
  }, [session?.user, isClient]) // Removed callback dependencies since we use refs

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting SSE...')
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    reconnectAttempts.current = 0
  }, [])

  // Connect when session is available - using session.user.id instead of session?.user to prevent frequent updates
  useEffect(() => {
    if (session?.user?.id && isClient) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [session?.user?.id, isClient, connect, disconnect]) // Include connect/disconnect but they should be stable now

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected: isClient && eventSourceRef.current?.readyState === EventSource.OPEN,
    reconnect: connect,
    disconnect,
  }
}