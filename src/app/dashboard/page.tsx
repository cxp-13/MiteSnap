'use client'

import { useState } from 'react'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { useMockUser } from '@/context/MockUserContext'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import DuvetsPage from './components/DuvetsPage'
import OrdersPage from './components/OrdersPage'
import AddressesPage from './components/AddressesPage'

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUnifiedUser()
  const { isMockMode, signOut } = useMockUser()
  const [activeTab, setActiveTab] = useState<'duvets' | 'orders' | 'addresses'>('duvets')

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  // Not signed in state
  if (!isSignedIn && !isMockMode) {
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

  // Render page content based on active tab
  const renderPageContent = () => {
    switch (activeTab) {
      case 'duvets':
        return <DuvetsPage userId={userId} />
      case 'orders':
        return <OrdersPage userId={userId} />
      case 'addresses':
        return <AddressesPage userId={userId} />
      default:
        return <DuvetsPage userId={userId} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header user={user} isMockMode={isMockMode} signOut={signOut} />

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderPageContent()}
          </div>
        </main>
      </div>
    </div>
  )
}