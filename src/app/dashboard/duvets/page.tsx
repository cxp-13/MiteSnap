'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import DuvetsPage from '../components/DuvetsPage'

export default function DuvetsRoute() {
  const { user, isLoaded, isSignedIn } = useUnifiedUser()

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">Unable to load user information</p>
        </div>
      </div>
    )
  }

  const userId = user.id

  return (
    <div className="bg-gray-50 flex flex-1">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <DuvetsPage userId={userId} />
          </div>
        </main>
      </div>
    </div>
  )
}