'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUnifiedUser()
  const router = useRouter()

  // Redirect to duvets page once user is loaded
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user?.id) {
        router.replace('/dashboard/duvets')
      }
    }
  }, [isLoaded, isSignedIn, user?.id, router])

  // Loading state
  if (!isLoaded) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to access the dashboard</p>
        </div>
      </div>
    )
  }

  // No user ID available
  if (!user?.id) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">Unable to load user information</p>
        </div>
      </div>
    )
  }

  // This should not render as useEffect will redirect
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  )
}