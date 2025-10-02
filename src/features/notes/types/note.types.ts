/**
 * Notes Feature Types
 * Shared types for notes UI components
 */

export interface Note {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NoteStats {
  total: number
  pinned: number
  categories: Array<{
    category: string
    count: number
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
  recentlyUpdated: number
}

export interface CreateNoteInput {
  title: string
  content: string
  category: string
  tags: string[]
  isPinned: boolean
}

export interface UpdateNoteInput {
  id: string
  title?: string
  content?: string
  category?: string
  tags?: string[]
  isPinned?: boolean
}

export interface NotesListProps {
  notes: Note[]
  isLoading?: boolean
  onEdit: (noteId: string) => void
  onDelete: (noteId: string) => void
  onPin: (noteId: string, isPinned: boolean) => void
}

export interface NoteEditorProps {
  note?: Note
  isLoading?: boolean
  onSave: (data: CreateNoteInput | UpdateNoteInput) => void
  onCancel: () => void
}

export interface TagSelectorProps {
  selectedTags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export interface NoteCardProps {
  note: Note
  onEdit: (noteId: string) => void
  onDelete: (noteId: string) => void
  onPin: (noteId: string, isPinned: boolean) => void
  onClick?: (noteId: string) => void
}

export interface NotesFilters {
  category?: string
  tag?: string
  search?: string
  pinnedOnly?: boolean
}

export interface NotesSearchParams {
  limit?: number
  offset?: number
  category?: string
  tag?: string
  search?: string
  pinnedOnly?: boolean
}