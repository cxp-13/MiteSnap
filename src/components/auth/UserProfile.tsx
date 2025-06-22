'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/auth'

export default function UserProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await authService.signOut()
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
      <div className="flex-1">
        <p className="font-medium">Welcome!</p>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}