import { db } from '@/lib/db'

// Cache debug mode status to avoid frequent database queries
let debugModeCache: { enabled: boolean; lastChecked: number } | null = null
const CACHE_DURATION = 30000 // 30 seconds

export async function isDebugModeEnabled(): Promise<boolean> {
  try {
    // Check cache first
    if (debugModeCache && (Date.now() - debugModeCache.lastChecked) < CACHE_DURATION) {
      return debugModeCache.enabled
    }

    // Get settings from database
    const settings = await db.systemSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    const enabled = settings?.debugMode ?? false

    // Update cache
    debugModeCache = {
      enabled,
      lastChecked: Date.now()
    }

    return enabled
  } catch (error) {
    console.error('Failed to check debug mode status:', error)
    return false
  }
}

export function debugLog(message: string, data?: any) {
  // Always log if explicitly enabled via environment variable
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
    const timestamp = new Date().toISOString()
    if (data) {
      console.log(`🐛 [DEBUG ${timestamp}] ${message}`, data)
    } else {
      console.log(`🐛 [DEBUG ${timestamp}] ${message}`)
    }
  }
}

export async function debugLogConditional(message: string, data?: any) {
  if (await isDebugModeEnabled()) {
    const timestamp = new Date().toISOString()
    if (data) {
      console.log(`🐛 [DEBUG ${timestamp}] ${message}`, data)
    } else {
      console.log(`🐛 [DEBUG ${timestamp}] ${message}`)
    }
  }
}

export function getDebugHeaders() {
  return {
    'X-Debug-Mode': 'enabled',
    'X-Debug-Timestamp': new Date().toISOString()
  }
}

export function createDebugInfo(operation: string, input?: any, timing?: number) {
  return {
    operation,
    timestamp: new Date().toISOString(),
    input: input ? JSON.stringify(input, null, 2) : undefined,
    timing: timing ? `${timing}ms` : undefined,
    nodeEnv: process.env.NODE_ENV,
    requestId: Math.random().toString(36).substring(7)
  }
}

// Clear cache when settings change
export function clearDebugCache() {
  debugModeCache = null
}