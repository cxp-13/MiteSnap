import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

interface User {
  id: string
  name?: string
}

interface HeaderProps {
  user: User | null
  signOut: () => void
}

export default function Header({ user, signOut }: HeaderProps) {
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
          <UserButton />
        </div>
      </div>
    </header>
  )
}