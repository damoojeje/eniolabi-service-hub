'use client'

/**
 * Notes Index Page
 * Main notes listing with search, filtering, and management
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  PlusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useNotes } from '@/features/notes/hooks/useNotes'
import { NotesList } from '@/features/notes/components/NotesList'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotesFilters } from '@/features/notes/types/note.types'

export default function NotesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { addToast } = useNotifications()
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (status === 'unauthenticated' || !session) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to access notes'
      })
      router.push('/auth/signin')
      return
    }
  }, [session, status, router, addToast])

  const {
    notes,
    total,
    hasMore,
    noteStats,
    categories,
    tags,
    searchParams,
    updateSearchParams,
    isLoadingStats,
    isDeleting,
    deleteNote,
    pinNote,
    loadMore,
    isLoadingNotes
  } = useNotes()

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
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

  const handleEdit = (noteId: string) => {
    router.push(`/notes/${noteId}`)
  }

  const handleFiltersChange = (filters: NotesFilters) => {
    updateSearchParams(filters)
  }

  const handlePin = async (noteId: string, isPinned: boolean) => {
    const result = await pinNote(noteId, isPinned)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: isPinned ? 'Note pinned' : 'Note unpinned'
      })
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to update note'
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return

    const result = await deleteNote(noteToDelete)
    
    if (result.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Note deleted successfully'
      })
      setNoteToDelete(null)
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: result.error || 'Failed to delete note'
      })
    }
  }

  const getNoteToDelete = () => {
    return notes.find(n => n.id === noteToDelete)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header with Apple Design Philosophy */}
        <div className="mb-8">
          {/* Back Button - Apple Style */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 group"
            >
              <svg 
                className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
                My Notes
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 font-light">
                Organize your thoughts, ideas, and information
              </p>
            </div>
            <Link
              href="/notes/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Note
            </Link>
          </div>
        </div>

        {/* Statistics - Apple Design Philosophy */}
        {isLoadingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/30 dark:border-gray-700/30 animate-pulse">
                <div className="flex items-center">
                  <div className="p-3 rounded-2xl bg-gray-200/50 dark:bg-gray-600/50 w-14 h-14"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-8 bg-gray-200/50 dark:bg-gray-600/50 rounded w-16"></div>
                    <div className="h-4 bg-gray-200/50 dark:bg-gray-600/50 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {noteStats && !isLoadingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm">
                  <DocumentTextIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {noteStats.total || 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Notes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {noteStats.pinned || 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pinned Notes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {noteStats.categories?.length || 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Categories
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center">
                <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-900/30 backdrop-blur-sm">
                  <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                    {noteStats.recentlyUpdated || 0}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Recent Updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <NotesList
          notes={notes || []}
          isLoading={isLoadingNotes}
          onEdit={handleEdit}
          onDelete={(noteId) => setNoteToDelete(noteId)}
          onPin={handlePin}
          categories={categories || []}
          tags={tags || []}
          onFiltersChange={handleFiltersChange}
          total={total || 0}
          hasMore={hasMore || false}
          onLoadMore={loadMore}
          isLoadingMore={isLoadingNotes}
        />

        {/* Delete Confirmation Modal - Apple Design Philosophy */}
        {noteToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm mr-4">
                  <ExclamationTriangleIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  Delete Note
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-base leading-relaxed">
                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{getNoteToDelete()?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setNoteToDelete(null)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isDeleting}
                >
                  {isDeleting && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}