/**
 * Shared authentication utilities
 * Eliminates duplication of authentication checks across API routes and components
 */

import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'

/**
 * Role hierarchy levels for permission checking
 */
const ROLE_LEVELS = {
  ADMIN: 3,
  POWER_USER: 2,
  GUEST: 1,
} as const

/**
 * Authentication helper functions
 */
export const authUtils = {
  /**
   * Check if user has required role level or higher
   */
  hasRoleLevel: (userRole: string, requiredLevel: number): boolean => {
    const userLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || 0
    return userLevel >= requiredLevel
  },
  
  /**
   * Check if user has specific role
   */
  hasRole: (userRole: string, requiredRole: string | string[]): boolean => {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    return requiredRoles.includes(userRole)
  },
  
  /**
   * Check if user is admin
   */
  isAdmin: (userRole: string): boolean => {
    return userRole === 'ADMIN'
  },
  
  /**
   * Check if user can manage services
   */
  canManageServices: (userRole: string): boolean => {
    return ['ADMIN', 'POWER_USER'].includes(userRole)
  },
  
  /**
   * Check if user can manage other users
   */
  canManageUsers: (userRole: string): boolean => {
    return userRole === 'ADMIN'
  },
  
  /**
   * Check if user can access admin features
   */
  canAccessAdmin: (userRole: string): boolean => {
    return authUtils.hasRoleLevel(userRole, ROLE_LEVELS.POWER_USER)
  },
  
  /**
   * Get user role level for comparison
   */
  getRoleLevel: (userRole: string): number => {
    return ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || 0
  },
  
  /**
   * Compare user roles (returns positive if first role is higher)
   */
  compareRoles: (role1: string, role2: string): number => {
    return authUtils.getRoleLevel(role1) - authUtils.getRoleLevel(role2)
  },
}

/**
 * API route authentication helpers
 */
export const apiAuthUtils = {
  /**
   * Create unauthorized response
   */
  unauthorizedResponse: (message = 'Unauthorized') => {
    return NextResponse.json({ error: message }, { status: 401 })
  },
  
  /**
   * Create forbidden response
   */
  forbiddenResponse: (message = 'Forbidden') => {
    return NextResponse.json({ error: message }, { status: 403 })
  },
  
  /**
   * Check authentication for API route
   */
  checkAuth: async (authOptions: any): Promise<{
    session: Session | null
    response: NextResponse | null
  }> => {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return {
        session: null,
        response: apiAuthUtils.unauthorizedResponse()
      }
    }
    
    return {
      session,
      response: null
    }
  },
  
  /**
   * Check role-based authorization for API route
   */
  checkRoleAuth: async (
    authOptions: any, 
    requiredRole: string | string[]
  ): Promise<{
    session: Session | null
    response: NextResponse | null
  }> => {
    const { session, response } = await apiAuthUtils.checkAuth(authOptions)
    
    if (response) {
      return { session, response }
    }
    
    if (!session?.user?.role || !authUtils.hasRole(session.user.role, requiredRole)) {
      return {
        session,
        response: apiAuthUtils.forbiddenResponse('Insufficient permissions')
      }
    }
    
    return { session, response: null }
  },
  
  /**
   * Check admin authorization for API route
   */
  checkAdminAuth: async (authOptions: any): Promise<{
    session: Session | null
    response: NextResponse | null
  }> => {
    return apiAuthUtils.checkRoleAuth(authOptions, 'ADMIN')
  },
  
  /**
   * Check service management authorization for API route
   */
  checkServiceManagementAuth: async (authOptions: any): Promise<{
    session: Session | null
    response: NextResponse | null
  }> => {
    return apiAuthUtils.checkRoleAuth(authOptions, ['ADMIN', 'POWER_USER'])
  },
}

/**
 * Client-side authentication utilities
 */
export const clientAuthUtils = {
  /**
   * Check if session allows role-based access
   */
  canAccess: (session: Session | null, requiredRole: string | string[]): boolean => {
    if (!session?.user?.role) return false
    return authUtils.hasRole(session.user.role, requiredRole)
  },
  
  /**
   * Check if session allows admin access
   */
  canAccessAdmin: (session: Session | null): boolean => {
    return clientAuthUtils.canAccess(session, ['ADMIN', 'POWER_USER'])
  },
  
  /**
   * Check if session allows service management
   */
  canManageServices: (session: Session | null): boolean => {
    return clientAuthUtils.canAccess(session, ['ADMIN', 'POWER_USER'])
  },
  
  /**
   * Check if session allows user management
   */
  canManageUsers: (session: Session | null): boolean => {
    return clientAuthUtils.canAccess(session, 'ADMIN')
  },
  
  /**
   * Get user display name from session
   */
  getUserDisplayName: (session: Session | null): string => {
    if (!session?.user) return 'Guest'
    return session.user.name || session.user.email || session.user.username || 'User'
  },
  
  /**
   * Get user initials for avatar
   */
  getUserInitials: (session: Session | null): string => {
    const name = clientAuthUtils.getUserDisplayName(session)
    if (name === 'Guest' || name === 'User') return name.charAt(0)
    
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    
    return name.slice(0, 2).toUpperCase()
  },
}

/**
 * Role-based component rendering utilities
 */
export const roleBasedRendering = {
  /**
   * Conditionally render content based on role
   */
  renderForRole: (
    session: Session | null,
    requiredRole: string | string[],
    content: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return clientAuthUtils.canAccess(session, requiredRole) ? content : (fallback || null)
  },
  
  /**
   * Conditionally render admin content
   */
  renderForAdmin: (
    session: Session | null,
    content: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return roleBasedRendering.renderForRole(session, 'ADMIN', content, fallback)
  },
  
  /**
   * Conditionally render service management content
   */
  renderForServiceManagement: (
    session: Session | null,
    content: React.ReactNode,
    fallback?: React.ReactNode
  ) => {
    return roleBasedRendering.renderForRole(session, ['ADMIN', 'POWER_USER'], content, fallback)
  },
}