/**
 * User Management Feature Types
 * Shared types for user management UI components
 */

import { Role } from '@prisma/client'

export interface User {
  id: string
  username: string
  email: string
  name?: string | null
  role: Role
  isActive: boolean
  mustChangePassword?: boolean
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  total: number
  roles: {
    admins: number
    powerUsers: number
    guests: number
  }
  status: {
    active: number
    inactive: number
  }
  recentLogins: number
}

export interface CreateUserInput {
  username: string
  email: string
  name?: string
  password: string
  role: Role
}

export interface UpdateUserInput {
  id: string
  username?: string
  email?: string
  name?: string
  role?: Role
  isActive?: boolean
}

export interface UserTableProps {
  users: User[]
  isLoading?: boolean
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
  onResetPassword: (userId: string) => void
}

export interface UserFormProps {
  user?: User
  isLoading?: boolean
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void
  onCancel: () => void
}