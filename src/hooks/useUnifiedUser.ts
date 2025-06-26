'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'
import { useMockUser } from '@/context/MockUserContext'

export function useUnifiedUser() {
  const clerkUser = useClerkUser()
  const mockUser = useMockUser()

  // If mock mode is enabled, use mock user data
  if (mockUser.isMockMode) {
    return {
      user: mockUser.mockUser,
      isLoaded: mockUser.isLoaded,
      isSignedIn: mockUser.isSignedIn
    }
  }

  // Otherwise use Clerk data
  return {
    user: clerkUser.user ? {
      id: clerkUser.user.id,
      name: clerkUser.user.fullName || 'User',
      email: clerkUser.user.primaryEmailAddress?.emailAddress || ''
    } : null,
    isLoaded: clerkUser.isLoaded,
    isSignedIn: clerkUser.isSignedIn
  }
}