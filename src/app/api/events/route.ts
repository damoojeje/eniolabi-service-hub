import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { subscriber, REDIS_CHANNELS } from '@/lib/redis'

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create SSE headers with improved keepalive settings
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Keep-Alive': 'timeout=120, max=1000' // Keep connection alive longer
  })

  const encoder = new TextEncoder()
  let isConnectionActive = true

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'SSE connection established',
        timestamp: new Date().toISOString(),
      })}\n\n`
      controller.enqueue(encoder.encode(initialMessage))

      // Subscribe to Redis channels
      const subscribeToChannels = async () => {
        try {
          // Subscribe to service status updates
          await subscriber.subscribe(REDIS_CHANNELS.SERVICE_STATUS_UPDATE, (message) => {
            if (!isConnectionActive) return
            
            try {
              const data = JSON.parse(message)
              const sseMessage = `data: ${JSON.stringify({
                type: 'service_status_update',
                data,
              })}\n\n`
              controller.enqueue(encoder.encode(sseMessage))
            } catch (error) {
              console.error('Error parsing service status update message:', error)
            }
          })

          // Subscribe to health check triggers
          await subscriber.subscribe(REDIS_CHANNELS.SERVICE_HEALTH_CHECK, (message) => {
            if (!isConnectionActive) return
            
            try {
              const data = JSON.parse(message)
              const sseMessage = `data: ${JSON.stringify({
                type: 'health_check_triggered',
                data,
              })}\n\n`
              controller.enqueue(encoder.encode(sseMessage))
            } catch (error) {
              console.error('Error parsing health check message:', error)
            }
          })

          // Subscribe to user activity (admin only)
          if (session.user.role === 'ADMIN') {
            await subscriber.subscribe(REDIS_CHANNELS.USER_ACTIVITY, (message) => {
              if (!isConnectionActive) return
              
              try {
                const data = JSON.parse(message)
                const sseMessage = `data: ${JSON.stringify({
                  type: 'user_activity',
                  data,
                })}\n\n`
                controller.enqueue(encoder.encode(sseMessage))
              } catch (error) {
                console.error('Error parsing user activity message:', error)
              }
            })
          }

          console.log(`✅ SSE subscriptions established for user: ${session.user.username}`)
        } catch (error) {
          console.error('❌ Error subscribing to Redis channels:', error)
          
          const errorMessage = `data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to establish real-time updates',
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(encoder.encode(errorMessage))
        }
      }

      subscribeToChannels()

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (!isConnectionActive) {
          clearInterval(heartbeatInterval)
          return
        }
        
        const heartbeat = `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })}\n\n`
        
        try {
          controller.enqueue(encoder.encode(heartbeat))
        } catch (error) {
          console.log('Connection closed, stopping heartbeat')
          isConnectionActive = false
          clearInterval(heartbeatInterval)
        }
      }, 15000) // Every 15 seconds - more frequent heartbeat

      // Handle connection close
      request.signal.addEventListener('abort', () => {
        console.log(`🔌 SSE connection closed for user: ${session.user.username}`)
        isConnectionActive = false
        clearInterval(heartbeatInterval)
        controller.close()
      })
    },

    cancel() {
      console.log('SSE stream cancelled')
      isConnectionActive = false
    }
  })

  return new Response(stream, { headers })
}