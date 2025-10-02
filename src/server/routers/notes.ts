import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { 
  errors,
  errorHelpers,
  commonSchemas
} from '@/shared'

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  tags: z.array(z.string().max(30, 'Tag must be less than 30 characters')),
  isPinned: z.boolean(),
})

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters').optional(),
  tags: z.array(z.string().max(30, 'Tag must be less than 30 characters')).optional(),
  isPinned: z.boolean().optional(),
})

export const notesRouter = createTRPCRouter({
  // Get all notes for current user
  getNotes: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      tag: z.string().optional(),
      search: z.string().optional(),
      pinnedOnly: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional().default({}))
    .query(async ({ ctx, input = {} }) => {
      const { category, tag, search, pinnedOnly, limit, offset } = input
      
      const where: any = {
        userId: ctx.session.user.id,
      }

      if (category) {
        where.category = category
      }

      if (tag) {
        where.tags = {
          has: tag
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (pinnedOnly) {
        where.isPinned = true
      }

      const [notes, total] = await Promise.all([
        ctx.db.note.findMany({
          where,
          orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' }
          ],
          take: limit,
          skip: offset,
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            tags: true,
            isPinned: true,
            createdAt: true,
            updatedAt: true,
          }
        }),
        ctx.db.note.count({ where })
      ])

      return {
        notes,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Get single note by ID
  getNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.db.note.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      if (!note) {
        throw errors.notFound('Note not found')
      }

      return note
    }),

  // Create new note
  createNote: protectedProcedure
    .input(createNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.note.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return note
    }),

  // Update existing note
  updateNote: protectedProcedure
    .input(updateNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Verify note belongs to user
      const existingNote = await ctx.db.note.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        }
      })

      if (!existingNote) {
        throw errors.notFound('Note not found')
      }

      const note = await ctx.db.note.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return note
    }),

  // Delete note
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify note belongs to user
      const existingNote = await ctx.db.note.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        }
      })

      if (!existingNote) {
        throw errors.notFound('Note not found')
      }

      await ctx.db.note.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  // Pin/unpin note
  pinNote: protectedProcedure
    .input(z.object({
      id: z.string(),
      isPinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify note belongs to user
      const existingNote = await ctx.db.note.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        }
      })

      if (!existingNote) {
        throw errors.notFound('Note not found')
      }

      const note = await ctx.db.note.update({
        where: { id: input.id },
        data: { isPinned: input.isPinned },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return note
    }),

  // Get note statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, pinned, categories, recentlyUpdated] = await Promise.all([
      ctx.db.note.count({
        where: { userId: ctx.session.user.id }
      }),
      ctx.db.note.count({
        where: { 
          userId: ctx.session.user.id,
          isPinned: true 
        }
      }),
      ctx.db.note.groupBy({
        by: ['category'],
        where: { userId: ctx.session.user.id },
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        },
        take: 10
      }),
      ctx.db.note.count({
        where: {
          userId: ctx.session.user.id,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    // Get all unique tags
    const notesWithTags = await ctx.db.note.findMany({
      where: { userId: ctx.session.user.id },
      select: { tags: true }
    })

    const allTags = notesWithTags.flatMap(note => note.tags)
    const uniqueTags = [...new Set(allTags)]
    const tagCounts = uniqueTags.map(tag => ({
      tag,
      count: allTags.filter(t => t === tag).length
    })).sort((a, b) => b.count - a.count).slice(0, 10)

    return {
      total,
      pinned,
      categories: categories.map(cat => ({
        category: cat.category,
        count: cat._count.category
      })),
      topTags: tagCounts,
      recentlyUpdated,
    }
  }),

  // Get all unique categories for user
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.note.findMany({
      where: { userId: ctx.session.user.id },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })

    return categories.map(c => c.category)
  }),

  // Get all unique tags for user
  getTags: protectedProcedure.query(async ({ ctx }) => {
    const notes = await ctx.db.note.findMany({
      where: { userId: ctx.session.user.id },
      select: { tags: true }
    })

    const allTags = notes.flatMap(note => note.tags)
    const uniqueTags = [...new Set(allTags)].sort()
    
    return uniqueTags
  }),
})