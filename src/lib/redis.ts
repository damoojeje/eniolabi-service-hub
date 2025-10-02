import { createClient } from 'redis'

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL
  }
  
  const host = process.env.REDIS_HOST || 'localhost'
  const port = process.env.REDIS_PORT || '6380'
  const password = process.env.REDIS_PASSWORD || ''
  
  return `redis://:${password}@${host}:${port}`
}

// Redis configuration options for production optimization
const getRedisConfig = () => {
  const baseConfig = {
    url: getRedisUrl(),
    socket: {
      keepAlive: true,
      reconnectDelay: 1000,
      connectTimeout: 5000,
    },
    // Connection pool settings
    ...(process.env.NODE_ENV === 'production' && {
      socket: {
        keepAlive: true,
        reconnectDelay: 1000,
        connectTimeout: 5000,
        commandTimeout: 5000,
      },
      // Retry configuration
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    }),
  }
  
  return baseConfig
}

// Create Redis client for general use
export const redis = createClient(getRedisConfig())

// Create separate Redis client for publishing
export const publisher = createClient(getRedisConfig())

// Create separate Redis client for subscribing  
export const subscriber = createClient(getRedisConfig())

// Initialize connections
let redisConnected = false
let publisherConnected = false
let subscriberConnected = false

const connectRedis = async () => {
  try {
    if (!redisConnected) {
      await redis.connect()
      redisConnected = true
      console.log('✅ Redis connected successfully')
    }
    
    if (!publisherConnected) {
      await publisher.connect()
      publisherConnected = true
      console.log('✅ Redis publisher connected successfully')
    }
    
    if (!subscriberConnected) {
      await subscriber.connect()
      subscriberConnected = true
      console.log('✅ Redis subscriber connected successfully')
    }
  } catch (error) {
    console.error('❌ Redis connection error:', error)
    throw error
  }
}

// Initialize connections
connectRedis().catch(console.error)

// Redis channels
export const REDIS_CHANNELS = {
  SERVICE_STATUS_UPDATE: 'service_status_update',
  SERVICE_HEALTH_CHECK: 'service_health_check',
  USER_ACTIVITY: 'user_activity',
} as const

// Utility functions
export const publishServiceStatusUpdate = async (serviceId: string, status: any) => {
  try {
    await publisher.publish(
      REDIS_CHANNELS.SERVICE_STATUS_UPDATE,
      JSON.stringify({
        serviceId,
        status,
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error('Error publishing service status update:', error)
  }
}

export const publishHealthCheckTrigger = async (serviceIds?: string[]) => {
  try {
    await publisher.publish(
      REDIS_CHANNELS.SERVICE_HEALTH_CHECK,
      JSON.stringify({
        serviceIds: serviceIds || null, // null means check all services
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error('Error publishing health check trigger:', error)
  }
}

export const publishUserActivity = async (userId: string, activity: string, metadata?: any) => {
  try {
    await publisher.publish(
      REDIS_CHANNELS.USER_ACTIVITY,
      JSON.stringify({
        userId,
        activity,
        metadata,
        timestamp: new Date().toISOString(),
      })
    )
  } catch (error) {
    console.error('Error publishing user activity:', error)
  }
}