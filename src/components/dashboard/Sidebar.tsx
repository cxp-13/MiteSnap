'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  // Determine active tab from URL path
  const getActiveTab = () => {
    if (pathname.includes('/dashboard/addresses')) return 'addresses'
    if (pathname.includes('/dashboard/orders')) return 'orders'
    return 'duvets'
  }

  const currentActiveTab = getActiveTab()

  return (
    <div className="w-64 bg-black text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="MiteSnap Logo" 
            width={32} 
            height={32}
          />
          <h1 className="text-xl font-semibold">MiteSnap</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <Link
            href="/dashboard/duvets"
            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentActiveTab === 'duvets'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            My Duvets
          </Link>
          <Link
            href="/dashboard/addresses"
            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentActiveTab === 'addresses'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            My Addresses
          </Link>
          <Link
            href="/dashboard/orders"
            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentActiveTab === 'orders'
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            View Nearby Orders
          </Link>
        </div>
      </nav>
    </div>
  )
}