'use client'

/**
 * Create Note Page
 * Page for creating new notes
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { NoteEditor } from '@/features/notes/components/NoteEditor'
import { useNotifications } from '@/contexts/NotificationContext'
import { useNotes } from '@/features/notes/hooks/useNotes'
import { CreateNoteInput, UpdateNoteInput } from '@/features/notes/types/note.types'
import Link from 'next/link'

export default function NewNotePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { addToast } = useNotifications()
  const { createNote, isSubmitting } = useNotes()
  
  // Check authentication
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (status === 'unauthenticated' || !session) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to create notes'
      })
      router.push('/auth/signin')
      return
    }
  }, [session, status, router, addToast])
  
  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null
  }
  
  const handleSave = async (noteData: CreateNoteInput | UpdateNoteInput) => {
    if ('id' in noteData) {
      throw new Error('Cannot update note in create mode')
    }
    try {
      const result = await createNote(noteData)
      
      if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Note created successfully'
      })
        // Navigate back to notes list instead of non-existent single note route
        router.push('/notes')
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to create note'
        })
      }
    } catch (error) {
      console.error('Note creation error:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while creating the note'
      })
    }
  }

  const handleCancel = () => {
    router.push('/notes')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/notes"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Notes
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Note
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Write down your thoughts, ideas, or information
            </p>
          </div>
        </div>

        {/* Note Editor */}
        <NoteEditor
          note={undefined}
          isLoading={isSubmitting}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}