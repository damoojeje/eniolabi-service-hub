import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { 
  findUserById, 
  findUserByUsernameOrEmail,
  errors,
  errorHelpers,
  commonSchemas,
  objectSchemas
} from '@/shared'

export const usersRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user
  }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100).optional().nullable(),
      image: z.string().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log('updateProfile called with:', {
        userId: ctx.session.user.id,
        input
      })

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            name: input.name,
            image: input.image,
          },
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            image: true,
            role: true,
          },
        })

        console.log('Profile updated successfully:', {
          userId: updatedUser.id,
          newImage: updatedUser.image
        })

        return updatedUser
      } catch (error) {
        console.error('Failed to update profile:', error)
        throw error
      }
    }),

  // Admin only: Get all users
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Admin only: Get user by ID
  getById: adminProcedure
    .input(commonSchemas.id)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      })

      if (!user) {
        throw errors.userNotFound()
      }

      return user
    }),

  // Admin only: Create new user
  create: adminProcedure
    .input(objectSchemas.createUser)
    .mutation(async ({ ctx, input }) => {
      // Check if username or email already exists
      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [
            { username: input.username },
            { email: input.email },
          ],
        },
      })

      if (existingUser) {
        throw new Error('Username or email already exists')
      }

      const passwordHash = await bcrypt.hash(input.password, 12)

      return ctx.db.user.create({
        data: {
          username: input.username,
          email: input.email,
          name: input.name,
          passwordHash,
          role: input.role as Role,
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      })
    }),

  // Admin only: Update user
  update: adminProcedure
    .input(objectSchemas.updateUser)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if username or email already exists (excluding current user)
      if (input.username || input.email) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(input.username ? [{ username: input.username }] : []),
                  ...(input.email ? [{ email: input.email }] : []),
                ],
              },
            ],
          },
        })

        if (existingUser) {
          throw new Error('Username or email already exists')
        }
      }

      return ctx.db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      })
    }),

  // Admin only: Update user role
  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: commonSchemas.role,
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent changing own role
      if (input.userId === ctx.session.user.id) {
        throw new Error('Cannot change your own role')
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role as Role },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
      })
    }),

  // Admin only: Reset user password
  resetPassword: adminProcedure
    .input(z.object({
      id: z.string(),
      newPassword: z.string().min(6),
      mustChangePassword: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await bcrypt.hash(input.newPassword, 12)

      return ctx.db.user.update({
        where: { id: input },
        data: {
          passwordHash,
          mustChangePassword: input.mustChangePassword,
        },
        select: {
          id: true,
          username: true,
          email: true,
          mustChangePassword: true,
        },
      })
    }),

  // Admin only: Delete user
  delete: adminProcedure
    .input(commonSchemas.id)
    .mutation(async ({ ctx, input }) => {
      // Prevent deleting the current user
      if (input.id === ctx.session.user.id) {
        throw new Error('Cannot delete your own account')
      }

      return ctx.db.user.delete({
        where: { id: input },
        select: {
          id: true,
          username: true,
          email: true,
        },
      })
    }),

  // Admin only: Bulk delete users
  bulkDeleteUsers: adminProcedure
    .input(z.object({
      userIds: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent deleting the current user
      if (input.userIds.includes(ctx.session.user.id)) {
        throw new Error('Cannot delete your own account')
      }

      await ctx.db.user.deleteMany({
        where: {
          id: { in: input.userIds }
        }
      })

      return { success: true }
    }),

  // Admin only: Export users
  exportUsers: adminProcedure
    .input(z.object({
      format: z.enum(['csv', 'json'])
    }))
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (input.format === 'json') {
        return {
          content: JSON.stringify(users, null, 2),
          mimeType: 'application/json',
          filename: `users_${new Date().toISOString()}.json`
        }
      }

      // CSV format
      const headers = ['ID', 'Username', 'Email', 'Name', 'Role', 'Active', 'Created At', 'Updated At', 'Last Login']
      const rows = users.map(user => [
        user.id,
        user.username,
        user.email,
        user.name || '',
        user.role,
        user.isActive ? 'Yes' : 'No',
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
        user.lastLogin?.toISOString() || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return {
        content: csvContent,
        mimeType: 'text/csv',
        filename: `users_${new Date().toISOString()}.csv`
      }
    }),

  // User can change own password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: commonSchemas.password,
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      })

      if (!user || !user.passwordHash) {
        throw new Error('User not found or no password set')
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash
      )

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect')
      }

      const newPasswordHash = await bcrypt.hash(input.newPassword, 12)

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: false,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      })
    }),

  // Get user statistics (Admin only)
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [total, admins, powerUsers, guests, active, inactive, recentLogins] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({ where: { role: 'ADMIN' } }),
      ctx.db.user.count({ where: { role: 'POWER_USER' } }),
      ctx.db.user.count({ where: { role: 'GUEST' } }),
      ctx.db.user.count({ where: { isActive: true } }),
      ctx.db.user.count({ where: { isActive: false } }),
      ctx.db.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ])

    return {
      total,
      roles: {
        admins,
        powerUsers,
        guests,
      },
      status: {
        active,
        inactive,
      },
      recentLogins,
    }
  }),
})