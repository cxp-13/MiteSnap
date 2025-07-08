'use client'

import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import Sidebar from '@/components/dashboard/Sidebar'
import { MyOrdersPage } from '@/components/dashboard/MyOrdersPage'

export default function MyOrdersRoute() {
  const { user, isLoaded, isSignedIn } = useUnifiedUser()

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

  const userId = user.id

  return (
    <div className="flex h-screen" style={{ background: 'linear-gradient(135deg, #F8F8F8 0%, #F0F0F0 100%)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="w-full mx-auto px-4">
            {/* White rounded container with floating shadow */}
            <div className="bg-white rounded-2xl p-8" style={{ 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02)' 
            }}>
              <MyOrdersPage userId={userId} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}