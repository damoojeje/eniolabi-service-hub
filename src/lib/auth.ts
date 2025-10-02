import { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"
import { JWT } from "next-auth/jwt"

const prisma = new PrismaClient()

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      name?: string
      image?: string
      role: Role
    }
  }

  interface User {
    id: string
    username: string
    email: string
    name?: string
    image?: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: Role
  }
}

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET must be set')
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL must be set')
}

export const authOptions: NextAuthOptions = {
  // We're using JWT strategy, so we don't need the Prisma adapter
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username
            }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            return null
          }

          if (!user.isActive) {
            throw new Error("Account is disabled")
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          })

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          } as User
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
    secret: process.env.NEXTAUTH_SECRET,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // When user first signs in
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.image = user.image
        token.name = user.name
        token.email = user.email
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 JWT Callback - User signed in:', user.username)
        }
      }
      
      // Handle session updates by fetching fresh data from database
      if (trigger === "update" && token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id }
          })

          if (freshUser) {
            token.image = freshUser.image
            token.name = freshUser.name
            token.email = freshUser.email
            // Keep other fields as they don't change often
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 JWT Update - Refreshed user data for:', token.username)
            }
          }
        } catch (error) {
          console.error('Failed to refresh user data on session update:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
        session.user.image = token.image
        session.user.name = token.name
        session.user.email = token.email
        // Only log in development mode and reduce frequency
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Session Callback - Session created for:', token.username)
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
}

// RBAC Helper Functions
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy = {
    GUEST: 0,
    POWER_USER: 1,
    ADMIN: 2
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(userRole: Role, requiredRole: Role): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }
}