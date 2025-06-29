import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

interface User {
  id: string
  name?: string
}

interface HeaderProps {
  user: User | null
  isMockMode: boolean
  signOut: () => void
}

export default function Header({ user, isMockMode, signOut }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={24} 
            height={24}
          />
          <span className="text-lg font-semibold text-black">MiteSnap</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.name || 'User'}
          </span>
          {isMockMode ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {user?.name?.[0] || 'D'}
              </div>
              <button
                onClick={signOut}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  )
}