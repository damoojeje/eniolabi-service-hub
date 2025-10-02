'use client'

/**
 * Notes Management Hook
 * Custom hook for managing notes with tRPC integration
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { CreateNoteInput, UpdateNoteInput, NotesSearchParams } from '../types/note.types'
import { useErrorTracker } from '@/lib/errorTracking'

export function useNotes(initialParams: NotesSearchParams = {}) {
  const [searchParams, setSearchParams] = useState<NotesSearchParams>(initialParams)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = trpc.useUtils()
  const errorTracker = useErrorTracker()

  // Queries
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    refetch: refetchNotes,
  } = trpc.notes.getNotes.useQuery(searchParams)

  const {
    data: noteStats,
    isLoading: isLoadingStats
  } = trpc.notes.getStats.useQuery()

  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = trpc.notes.getCategories.useQuery()

  const {
    data: tags = [],
    isLoading: isLoadingTags
  } = trpc.notes.getTags.useQuery()

  // Mutations
  const createNoteMutation = trpc.notes.createNote.useMutation({
    onSuccess: () => {
      utils.notes.getNotes.invalidate()
      utils.notes.getStats.invalidate()
      utils.notes.getCategories.invalidate()
      utils.notes.getTags.invalidate()
    }
  })

  const updateNoteMutation = trpc.notes.updateNote.useMutation({
    onSuccess: () => {
      utils.notes.getNotes.invalidate()
      utils.notes.getStats.invalidate()
      utils.notes.getCategories.invalidate()
      utils.notes.getTags.invalidate()
    }
  })

  const deleteNoteMutation = trpc.notes.deleteNote.useMutation({
    onSuccess: () => {
      utils.notes.getNotes.invalidate()
      utils.notes.getStats.invalidate()
      utils.notes.getCategories.invalidate()
      utils.notes.getTags.invalidate()
    }
  })

  const pinNoteMutation = trpc.notes.pinNote.useMutation({
    onSuccess: () => {
      utils.notes.getNotes.invalidate()
      utils.notes.getStats.invalidate()
    }
  })

  // Helper functions
  const createNote = async (noteData: CreateNoteInput) => {
    setIsSubmitting(true)
    try {
      console.log('=== CREATE NOTE DEBUG ===')
      console.log('Input noteData:', noteData)
      console.log('Input type:', typeof noteData)
      console.log('Input keys:', Object.keys(noteData))
      console.log('Input JSON:', JSON.stringify(noteData, null, 2))
      console.log('========================')
      
      const note = await createNoteMutation.mutateAsync(noteData)
      console.log('Note created successfully:', note)
      return { success: true, note }
    } catch (error) {
      console.error('=== CREATE NOTE ERROR DEBUG ===')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('Full error details:', JSON.stringify(error, null, 2))
      console.error('================================')
      
      // Handle different types of errors and create persistent notifications
      if (error instanceof Error) {
        if (error.message.includes('UNAUTHORIZED')) {
          await errorTracker.trackAuthenticationError('notes-creation')
          return { 
            success: false, 
            error: 'You must be logged in to create notes. Please log in and try again.'
          }
        } else if (error.message.includes('FORBIDDEN')) {
          await errorTracker.trackPermissionError('notes-creation', 'create notes')
          return { 
            success: false, 
            error: 'You do not have permission to create notes.'
          }
        } else if (error.message.includes('Unable to transform response')) {
          await errorTracker.trackServerCommunicationError('notes-creation', 'Failed to save note data')
          return { 
            success: false, 
            error: 'Server communication error. Please check your connection and try again.'
          }
        } else if (error.message.includes('Invalid input') || error.message.includes('invalid_type')) {
          await errorTracker.trackValidationError('notes-creation', 'Invalid note data provided')
          return { 
            success: false, 
            error: 'Invalid note data. Please check your input and try again.'
          }
        } else {
          await errorTracker.trackGenericError('notes-creation', error)
          return { 
            success: false, 
            error: error.message || 'Failed to create note'
          }
        }
      } else {
        await errorTracker.trackGenericError('notes-creation', 'Unexpected error during note creation')
        return { 
          success: false, 
          error: 'An unexpected error occurred while creating the note'
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateNote = async (noteData: UpdateNoteInput) => {
    setIsSubmitting(true)
    try {
      console.log('=== UPDATE NOTE DEBUG ===')
      console.log('Input noteData:', noteData)
      console.log('Input type:', typeof noteData)
      console.log('Input keys:', Object.keys(noteData))
      console.log('Input JSON:', JSON.stringify(noteData, null, 2))
      console.log('========================')
      
      const note = await updateNoteMutation.mutateAsync(noteData)
      console.log('Note updated successfully:', note)
      return { success: true, note }
    } catch (error) {
      console.error('=== UPDATE NOTE ERROR DEBUG ===')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('Full error details:', JSON.stringify(error, null, 2))
      console.error('================================')
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('UNAUTHORIZED')) {
          await errorTracker.trackAuthenticationError('notes-update')
          return { 
            success: false, 
            error: 'You must be logged in to update notes. Please log in and try again.'
          }
        } else if (error.message.includes('FORBIDDEN')) {
          await errorTracker.trackPermissionError('notes-update', 'update notes')
          return { 
            success: false, 
            error: 'You do not have permission to update this note.'
          }
        } else if (error.message.includes('Unable to transform response')) {
          await errorTracker.trackServerCommunicationError('notes-update', 'Failed to save note data')
          return { 
            success: false, 
            error: 'Server communication error. Please check your connection and try again.'
          }
        } else if (error.message.includes('Invalid input') || error.message.includes('invalid_type')) {
          await errorTracker.trackValidationError('notes-update', 'Invalid note data provided')
          return { 
            success: false, 
            error: 'Invalid note data. Please check your input and try again.'
          }
        } else {
          await errorTracker.trackGenericError('notes-update', error)
          return { 
            success: false, 
            error: error.message || 'Failed to update note'
          }
        }
      } else {
        await errorTracker.trackGenericError('notes-update', 'Unexpected error during note update')
        return { 
          success: false, 
          error: 'An unexpected error occurred while updating the note'
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      console.log('=== DELETE NOTE DEBUG ===')
      console.log('Note ID:', noteId)
      console.log('========================')
      
      await deleteNoteMutation.mutateAsync({ id: noteId })
      console.log('Note deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('=== DELETE NOTE ERROR DEBUG ===')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('Full error details:', JSON.stringify(error, null, 2))
      console.error('================================')
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('UNAUTHORIZED')) {
          await errorTracker.trackAuthenticationError('notes-delete')
          return { 
            success: false, 
            error: 'You must be logged in to delete notes. Please log in and try again.'
          }
        } else if (error.message.includes('FORBIDDEN')) {
          await errorTracker.trackPermissionError('notes-delete', 'delete notes')
          return { 
            success: false, 
            error: 'You do not have permission to delete this note.'
          }
        } else if (error.message.includes('Unable to transform response')) {
          await errorTracker.trackServerCommunicationError('notes-delete', 'Failed to delete note')
          return { 
            success: false, 
            error: 'Server communication error. Please check your connection and try again.'
          }
        } else if (error.message.includes('not found')) {
          await errorTracker.trackValidationError('notes-delete', 'Note not found')
          return { 
            success: false, 
            error: 'Note not found. It may have been already deleted.'
          }
        } else {
          await errorTracker.trackGenericError('notes-delete', error)
          return { 
            success: false, 
            error: error.message || 'Failed to delete note'
          }
        }
      } else {
        await errorTracker.trackGenericError('notes-delete', 'Unexpected error during note deletion')
        return { 
          success: false, 
          error: 'An unexpected error occurred while deleting the note'
        }
      }
    }
  }

  const pinNote = async (noteId: string, isPinned: boolean) => {
    try {
      console.log('=== PIN NOTE DEBUG ===')
      console.log('Note ID:', noteId)
      console.log('Is Pinned:', isPinned)
      console.log('========================')
      
      const note = await pinNoteMutation.mutateAsync({ id: noteId, isPinned })
      console.log('Note pin status updated successfully:', note)
      return { success: true, note }
    } catch (error) {
      console.error('=== PIN NOTE ERROR DEBUG ===')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'No message')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('Full error details:', JSON.stringify(error, null, 2))
      console.error('================================')
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('UNAUTHORIZED')) {
          await errorTracker.trackAuthenticationError('notes-pin')
          return { 
            success: false, 
            error: 'You must be logged in to pin/unpin notes. Please log in and try again.'
          }
        } else if (error.message.includes('FORBIDDEN')) {
          await errorTracker.trackPermissionError('notes-pin', 'pin/unpin notes')
          return { 
            success: false, 
            error: 'You do not have permission to pin/unpin this note.'
          }
        } else if (error.message.includes('Unable to transform response')) {
          await errorTracker.trackServerCommunicationError('notes-pin', 'Failed to update note pin status')
          return { 
            success: false, 
            error: 'Server communication error. Please check your connection and try again.'
          }
        } else if (error.message.includes('not found')) {
          await errorTracker.trackValidationError('notes-pin', 'Note not found')
          return { 
            success: false, 
            error: 'Note not found. It may have been deleted.'
          }
        } else {
          await errorTracker.trackGenericError('notes-pin', error)
          return { 
            success: false, 
            error: error.message || 'Failed to pin/unpin note'
          }
        }
      } else {
        await errorTracker.trackGenericError('notes-pin', 'Unexpected error during note pin/unpin')
        return { 
          success: false, 
          error: 'An unexpected error occurred while updating the note pin status'
        }
      }
    }
  }

  const updateSearchParams = (params: Partial<NotesSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params, offset: 0 }))
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const loadMore = () => {
    if (!notesData?.hasMore) return
    
    setSearchParams(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50)
    }))
  }

  return {
    // Data
    notes: notesData?.notes || [],
    total: notesData?.total || 0,
    hasMore: notesData?.hasMore || false,
    noteStats,
    categories,
    tags,
    
    // Search and filters
    searchParams,
    updateSearchParams,
    clearFilters,

    // Loading states
    isLoadingNotes,
    isLoadingStats,
    isLoadingCategories,
    isLoadingTags,
    isSubmitting,
    isDeleting: deleteNoteMutation.isPending,
    isPinning: pinNoteMutation.isPending,

    // Actions
    createNote,
    updateNote,
    deleteNote,
    pinNote,
    refetchNotes,
    loadMore
  }
}

// Hook for single note management
export function useNote(noteId: string | null) {
  const utils = trpc.useUtils()

  const { data: note, isLoading, error } = trpc.notes.getNote.useQuery(
    { id: noteId! },
    {
      enabled: !!noteId,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  const updateNoteMutation = trpc.notes.updateNote.useMutation({
    onSuccess: () => {
      utils.notes.getNotes.invalidate()
      utils.notes.getNote.invalidate({ id: noteId! })
      utils.notes.getStats.invalidate()
    }
  })

  const updateNote = async (noteData: UpdateNoteInput) => {
    try {
      const updatedNote = await updateNoteMutation.mutateAsync(noteData)
      return { success: true, note: updatedNote }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update note'
      }
    }
  }

  return {
    note,
    isLoading,
    error,
    updateNote,
    isUpdating: updateNoteMutation.isPending
  }
}