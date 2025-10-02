import { initTRPC, TRPCError } from '@trpc/server'
import { type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import superjson from 'superjson'
import { Role } from '@prisma/client'
import { cookies } from 'next/headers'
import { debugLogConditional, createDebugInfo } from '@/lib/debug'

export interface Context {
  req: NextRequest
  db: typeof db
  session: {
    user: {
      id: string
      username: string
      email: string
      name?: string
      image?: string
      role: Role
    }
  } | null
}

export const createTRPCContext = async (opts: { req: NextRequest }): Promise<Context> => {
  // Create a proper request object that getServerSession can understand
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('next-auth.session-token')?.value || 
                      cookieStore.get('__Secure-next-auth.session-token')?.value

  // Build headers object from NextRequest
  const headers = Object.fromEntries(opts.req.headers.entries())
  
  // Create a mock request/response for getServerSession
  const mockReq = {
    headers,
    cookies: Object.fromEntries(cookieStore.getAll().map(cookie => [cookie.name, cookie.value]))
  } as any

  const mockRes = {
    getHeader: () => null,
    setCookie: () => {},
    setHeader: () => {},
  } as any

  // Get session with proper request/response objects
  const session = await getServerSession(mockReq, mockRes, authOptions)
  
  // For debugging, temporarily enable logs to see what's happening
  console.log('🔐 tRPC Context Debug:')
  console.log('   Session Token:', sessionToken ? 'EXISTS' : 'NULL')
  console.log('   Session:', session ? 'EXISTS' : 'NULL')
  console.log('   Request URL:', opts.req.url)
  console.log('   Request Method:', opts.req.method)
  
  if (session?.user) {
    console.log('   ✅ User:', session.user.username, '| Role:', session.user.role)
  } else {
    console.log('   ❌ No session found - authentication will fail')
    console.log('   Available cookies:', Object.keys(Object.fromEntries(cookieStore.getAll().map(cookie => [cookie.name, cookie.value]))))
  }
  
  return {
    req: opts.req,
    db,
    session,
  }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Enhanced error formatting for debug mode
    return {
      ...shape,
      data: {
        ...shape.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }
  },
})

// Debug middleware for enhanced logging
const debugMiddleware = t.middleware(async ({ next, path, type, input }) => {
  const start = Date.now()

  // Log request if debug mode is enabled
  await debugLogConditional(
    `tRPC ${type.toUpperCase()} ${path} - START`,
    createDebugInfo(`${type}.${path}`, input, 0)
  )

  const result = await next()
  const duration = Date.now() - start

  // Log result if debug mode is enabled
  if (result.ok) {
    await debugLogConditional(
      `tRPC ${type.toUpperCase()} ${path} - SUCCESS`,
      createDebugInfo(`${type}.${path}`, undefined, duration)
    )
  } else {
    await debugLogConditional(
      `tRPC ${type.toUpperCase()} ${path} - ERROR`,
      {
        ...createDebugInfo(`${type}.${path}`, undefined, duration),
        error: result.error.message,
        code: result.error.code
      }
    )
  }

  return result
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure.use(debugMiddleware)

// Middleware for authentication
const isAuthenticated = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    // Add debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ tRPC Auth Failed - No session or user')
      console.log('   Session exists:', !!ctx.session)
      console.log('   User exists:', !!ctx.session?.user)
    }
    
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  
  // Add debug logging for successful auth
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ tRPC Auth Success - User:', ctx.session.user.username)
  }
  
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

// Middleware for role-based access control
const hasRole = (requiredRole: Role) => {
  return t.middleware(({ next, ctx }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      })
    }

    const roleHierarchy = {
      GUEST: 0,
      POWER_USER: 1,
      ADMIN: 2
    }

    if (roleHierarchy[ctx.session.user.role] < roleHierarchy[requiredRole]) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required role: ${requiredRole}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    })
  })
}

export const protectedProcedure = publicProcedure.use(isAuthenticated)
export const adminProcedure = publicProcedure.use(hasRole('ADMIN'))
export const powerUserProcedure = publicProcedure.use(hasRole('POWER_USER'))