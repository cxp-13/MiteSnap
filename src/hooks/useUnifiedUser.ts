'use client'

import { useUser as useClerkUser } from '@clerk/nextjs'

export function useUnifiedUser() {
  const clerkUser = useClerkUser()

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