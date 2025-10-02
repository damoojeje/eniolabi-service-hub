#!/usr/bin/env node

/**
 * Automated Health Monitoring Script
 * Checks all services and updates their status in the database
 */

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('redis')
const https = require('https')

// Dynamic import for node-fetch (ESM)
let fetch
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import('node-fetch')
    fetch = nodeFetch.default
  }
  return fetch
}
// const { sendServiceStatusNotification } = require('../src/lib/email')
// Email functionality temporarily disabled for CommonJS compatibility

const prisma = new PrismaClient()

// Redis client for publishing updates
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://:replaceme123@localhost:6380'
})

const REDIS_CHANNELS = {
  SERVICE_STATUS_UPDATE: 'service_status_update',
  SERVICE_HEALTH_CHECK: 'service_health_check',
}

async function checkServiceHealth(service) {
  const startTime = Date.now()
  const timeoutSeconds = service.timeoutSeconds || 10

  try {
    const fetchFn = await getFetch()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutSeconds * 1000)

    // Construct the full URL for health checking
    const fullUrl = service.healthEndpoint ? `${service.url}${service.healthEndpoint}` : service.url

    // Create HTTPS agent that ignores self-signed certificates for local services
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    })

    const response = await fetchFn(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      timeout: timeoutSeconds * 1000,
      agent: fullUrl.startsWith('https://') ? httpsAgent : undefined,
      headers: {
        'User-Agent': 'Eniolabi-Service-Monitor/1.0',
        'Accept': '*/*'
      }
    })

    clearTimeout(timeout)

    const responseTime = Date.now() - startTime
    const isHealthy = response.ok && response.status >= 200 && response.status < 400

    return {
      status: isHealthy ? 'ONLINE' : 'ERROR',
      responseTime,
      statusCode: response.status,
      errorMessage: isHealthy ? null : `HTTP ${response.status}: ${response.statusText}`
    }

  } catch (error) {
    const responseTime = Date.now() - startTime

    let status = 'OFFLINE'
    let errorMessage = error.message

    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      status = 'TIMEOUT'
      errorMessage = `Request timed out after ${timeoutSeconds}s`
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      status = 'OFFLINE'
      errorMessage = `Connection failed: ${error.code}`
    }

    return {
      status,
      responseTime,
      statusCode: null,
      errorMessage
    }
  }
}

async function updateServiceStatus(service, healthResult) {
  const statusData = {
    serviceId: service.id,
    status: healthResult.status,
    responseTime: healthResult.responseTime,
    statusCode: healthResult.statusCode,
    errorMessage: healthResult.errorMessage,
    checkedAt: new Date()
  }

  // Get the last status to detect changes
  const lastStatus = await prisma.serviceStatus.findFirst({
    where: { serviceId: service.id },
    orderBy: { checkedAt: 'desc' }
  })

  const statusChanged = !lastStatus || lastStatus.status !== healthResult.status

  // Save to database
  const newStatusRecord = await prisma.serviceStatus.create({ data: statusData })

  // Publish to Redis for real-time updates
  await redis.publish(
    REDIS_CHANNELS.SERVICE_STATUS_UPDATE,
    JSON.stringify({
      serviceId: service.id,
      status: statusData,
      timestamp: new Date().toISOString(),
    })
  )

  // Email notification temporarily disabled for initial setup
  if (statusChanged && shouldNotify(lastStatus?.status, healthResult.status)) {
    console.log(`📧 Status change detected for ${service.name}: ${lastStatus?.status || 'NEW'} -> ${healthResult.status} (email notifications disabled)`)
  }

  console.log(`[${new Date().toISOString()}] ${service.name}: ${healthResult.status} (${healthResult.responseTime}ms)${statusChanged ? ' [STATUS CHANGED]' : ''}`)
}

function shouldNotify(oldStatus, newStatus) {
  // Define which status changes should trigger notifications
  const criticalChanges = [
    'ONLINE->OFFLINE',
    'ONLINE->ERROR', 
    'OFFLINE->ONLINE',
    'ERROR->ONLINE',
    'WARNING->ERROR',
    'WARNING->OFFLINE'
  ]
  
  if (!oldStatus) return newStatus !== 'ONLINE' // Notify if first check and not online
  
  const transition = `${oldStatus}->${newStatus}`
  return criticalChanges.includes(transition)
}

async function runHealthChecks() {
  console.log(`[${new Date().toISOString()}] Starting health check cycle...`)

  try {
    // Connect to Redis
    await redis.connect()

    // Get all active services
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    console.log(`Found ${services.length} active services to monitor`)

    // Check all services concurrently
    const healthCheckPromises = services.map(async (service) => {
      try {
        const healthResult = await checkServiceHealth(service)
        await updateServiceStatus(service, healthResult)
        return { service: service.name, success: true, result: healthResult }
      } catch (error) {
        console.error(`Error checking ${service.name}:`, error.message)
        return { service: service.name, success: false, error: error.message }
      }
    })

    const results = await Promise.allSettled(healthCheckPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    console.log(`[${new Date().toISOString()}] Health check completed: ${successful} successful, ${failed} failed`)

  } catch (error) {
    console.error('Health check cycle failed:', error)
  } finally {
    await redis.disconnect()
    await prisma.$disconnect()
  }
}

// Run health checks
if (require.main === module) {
  runHealthChecks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { runHealthChecks, checkServiceHealth }