import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

// Create rate limiters for different endpoints
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  analytics: true,
})

export const healthCheckRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 health checks per minute
  analytics: true,
})

export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 admin actions per minute
  analytics: true,
})

// Helper function to check rate limit and return appropriate response
export async function checkRateLimit(
  rateLimit: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining?: number; reset?: Date }> {
  try {
    const result = await rateLimit.limit(identifier)
    
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset ? new Date(result.reset) : undefined,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open - allow the request if rate limit check fails
    return { success: true }
  }
}

// Middleware helper for Next.js API routes
export function withRateLimit(
  rateLimit: Ratelimit,
  getIdentifier: (req: Request) => string = (req) => 
    req.headers.get('x-forwarded-for') ?? 'anonymous'
) {
  return async function rateLimitMiddleware(
    req: Request,
    next: () => Promise<Response>
  ): Promise<Response> {
    const identifier = getIdentifier(req)
    const result = await checkRateLimit(rateLimit, identifier)
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          reset: result.reset?.toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': result.remaining?.toString() ?? '0',
            'X-RateLimit-Reset': result.reset?.toISOString() ?? '',
            'Retry-After': '60',
          },
        }
      )
    }
    
    const response = await next()
    
    // Add rate limit headers to successful responses
    if (result.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    }
    if (result.reset) {
      response.headers.set('X-RateLimit-Reset', result.reset.toISOString())
    }
    
    return response
  }
}