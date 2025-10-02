import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Simple in-memory cache for maintenance mode to avoid database calls
let maintenanceModeCache: { value: boolean; lastCheck: number } | null = null
const CACHE_TTL = 30000 // 30 seconds

async function getMaintenanceMode(): Promise<boolean> {
  const now = Date.now()

  // Return cached value if it's still fresh
  if (maintenanceModeCache && (now - maintenanceModeCache.lastCheck) < CACHE_TTL) {
    return maintenanceModeCache.value
  }

  try {
    console.log('🔧 Fetching maintenance mode from API...')
    // Instead of direct database access, we'll use the API route
    const response = await fetch(`http://localhost:3003/api/maintenance-status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      const maintenanceMode = data.maintenanceMode || false

      // Update cache
      maintenanceModeCache = {
        value: maintenanceMode,
        lastCheck: now
      }

      console.log('🔧 Maintenance mode status:', maintenanceMode)
      return maintenanceMode
    } else {
      console.log('🔧 Failed to fetch maintenance status, assuming disabled')
      return false
    }
  } catch (error) {
    console.error('🔧 Error checking maintenance mode:', error)
    return false // Default to false if we can't check
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  console.log('🔧 Middleware called for:', url.pathname)

  // Skip maintenance check for API routes and privileged routes
  const isApiRoute = url.pathname.startsWith('/api/')
  const isAdminRoute = url.pathname.startsWith('/admin') || url.pathname.startsWith('/dashboard')
  const isAuthRoute = url.pathname.startsWith('/auth') || url.pathname.startsWith('/maintenance')
  const isStaticFile = url.pathname.startsWith('/_next/') ||
                       url.pathname.includes('.') ||
                       url.pathname === '/favicon.ico'

  console.log('🔧 Route checks:', { isApiRoute, isAdminRoute, isAuthRoute, isStaticFile })

  // Check maintenance mode for regular pages
  if (!isApiRoute && !isStaticFile && !isAuthRoute) {
    console.log('🔧 Checking maintenance mode...')

    const maintenanceMode = await getMaintenanceMode()

    if (maintenanceMode) {
      console.log('🔧 Maintenance mode is enabled, checking user permissions...')

      // Check user permissions
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })

      console.log('🔧 User token:', token ? { role: token.role, username: token.username } : 'NO_TOKEN')

      // Allow ADMIN and POWER_USER access during maintenance
      const hasPrivilegedAccess = token?.role === 'ADMIN' || token?.role === 'POWER_USER'

      console.log('🔧 Privileged access:', hasPrivilegedAccess, 'Admin route:', isAdminRoute)

      if (!hasPrivilegedAccess && !isAdminRoute) {
        console.log('🔧 Redirecting to maintenance page...')
        // Redirect non-privileged users to maintenance page
        url.pathname = '/maintenance'
        return NextResponse.redirect(url)
      } else {
        console.log('🔧 Allowing access (privileged user or admin route)')
      }
    } else {
      console.log('🔧 Maintenance mode is disabled, proceeding normally')
    }
  } else {
    console.log('🔧 Skipping maintenance check (API/static/auth route)')
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}