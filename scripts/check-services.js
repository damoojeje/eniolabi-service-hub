#!/usr/bin/env node

/**
 * Script to manually trigger health checks for all services
 * This will update the service status in the database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkServiceHealth(url, healthEndpoint = '', timeoutSeconds = 10) {
  const startTime = Date.now()
  const fullUrl = healthEndpoint ? `${url}${healthEndpoint}` : url
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Eniolabi-Service-Hub/1.0',
        'Accept': 'application/json, text/plain, */*',
      },
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        status: 'ONLINE',
        responseTime,
        statusCode: response.status,
      }
    } else if (response.status === 405) {
      // Method not allowed - service is running but doesn't accept GET
      return {
        status: 'ONLINE',
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Method Not Allowed (Service Running)`,
      }
    } else if (response.status === 401) {
      // Authentication required - service is running but needs auth
      return {
        status: 'ONLINE',
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Authentication Required`,
      }
    } else if (response.status === 404) {
      // Not found - might be wrong endpoint but service could be running
      return {
        status: 'WARNING',
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: Endpoint Not Found`,
      }
    } else if (response.status >= 400 && response.status < 500) {
      return {
        status: 'ERROR',
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      }
    } else {
      return {
        status: 'WARNING',
        responseTime,
        statusCode: response.status,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    if (error.name === 'AbortError') {
      return {
        status: 'ERROR',
        responseTime,
        errorMessage: `Timeout after ${timeoutSeconds}s`,
      }
    }
    
    return {
      status: 'ERROR',
      responseTime,
      errorMessage: error.message || 'Unknown error',
    }
  }
}

async function checkAllServices() {
  try {
    console.log('🔍 Checking all services...')
    
    const services = await prisma.service.findMany({
      where: { isActive: true },
    })
    
    console.log(`Found ${services.length} active services`)
    
    for (const service of services) {
      console.log(`\n📡 Checking ${service.name}...`)
      console.log(`   URL: ${service.url}${service.healthEndpoint || ''}`)
      
      const healthResult = await checkServiceHealth(
        service.url,
        service.healthEndpoint || '',
        service.timeoutSeconds
      )
      
      console.log(`   Status: ${healthResult.status}`)
      console.log(`   Response Time: ${healthResult.responseTime}ms`)
      if (healthResult.statusCode) {
        console.log(`   Status Code: ${healthResult.statusCode}`)
      }
      if (healthResult.errorMessage) {
        console.log(`   Message: ${healthResult.errorMessage}`)
      }
      
      // Save the health check result
      await prisma.serviceStatus.create({
        data: {
          serviceId: service.id,
          status: healthResult.status,
          responseTime: healthResult.responseTime,
          statusCode: healthResult.statusCode,
          errorMessage: healthResult.errorMessage,
        },
      })
      
      console.log(`   ✅ Status saved to database`)
    }
    
    console.log('\n🎉 All services checked successfully!')
    
  } catch (error) {
    console.error('❌ Error checking services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllServices()
