'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import { UserButton } from '@clerk/nextjs'

export default function Sidebar() {
  const { user } = useUnifiedUser()
  const pathname = usePathname()

  // Determine active tab from URL path
  const getActiveTab = () => {
    if (pathname.includes('/dashboard/addresses')) return 'addresses'
    if (pathname.includes('/dashboard/my-orders')) return 'my-orders'
    if (pathname.includes('/dashboard/my-accepted-orders')) return 'my-accepted-orders'
    if (pathname.includes('/dashboard/orders')) return 'orders'
    if (pathname.includes('/dashboard/payment-methods')) return 'payment-methods'
    return 'duvets'
  }

  const currentActiveTab = getActiveTab()

  return (
    <div className="w-60 flex flex-col h-screen" style={{ 
      background: 'linear-gradient(135deg, #F8F8F8 0%, #F0F0F0 100%)'
    }}>
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo_line_black_bg_transport.png" 
            alt="MiteSnap Logo" 
            width={36} 
            height={36}
            className="rounded-lg"
          />
          <h1 className="text-lg font-semibold text-gray-900">MiteSnap</h1>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="px-4 py-6">
        {/* User Section */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            USER
          </p>
          
          <Link
            href="/dashboard/duvets"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'duvets'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'duvets' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-medium">My Duvets</span>
            </div>
          </Link>

          <Link
            href="/dashboard/addresses"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'addresses'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'addresses' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">My Addresses</span>
            </div>
          </Link>

          <Link
            href="/dashboard/my-orders"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'my-orders'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'my-orders' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">My Orders</span>
            </div>
          </Link>

          <Link
            href="/dashboard/payment-methods"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'payment-methods'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'payment-methods' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Payment Methods</span>
            </div>
          </Link>
        </div>

        {/* Service Provider Section */}
        <div className="space-y-1 mt-8">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            SERVICE PROVIDER
          </p>
          
          <Link
            href="/dashboard/orders"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'orders'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'orders' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">View Nearby Orders</span>
            </div>
          </Link>

          <Link
            href="/dashboard/my-accepted-orders"
            className={`flex items-center w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              currentActiveTab === 'my-accepted-orders'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 flex items-center justify-center ${
                currentActiveTab === 'my-accepted-orders' ? 'text-white' : 'text-gray-500'
              }`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">My Accepted Orders</span>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 mb-4">
            USER
          </p>
          <div className="flex items-center space-x-3 px-3">
            <div style={{
              boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 0, 0, 0.05)',
              borderRadius: '50%'
            }}>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '40px',
                      height: '40px'
                    }
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}