'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-lg text-orange-600">Loading...</div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-yellow-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome back, {user?.firstName || 'User'}!</h2>
            <p className="text-gray-600">
              Ready to experience SunSpec? Your sunshine valet service awaits.
            </p>
            <Link href="/dashboard">
              <button className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
                Start Your Sunshine Journey
              </button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#181824] via-[#23243a] to-[#1a1a1a] relative">
      <Header />
      <main className="flex flex-col md:flex-row items-center md:items-stretch justify-center min-h-screen px-6 md:px-20">
        {/* Left-aligned text block */}
        <div className="flex flex-col justify-center md:justify-center md:items-start items-center w-full md:w-1/2 py-24 md:py-0">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight text-left md:text-left">
            SunSpec
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/90 mb-8 max-w-xl text-left md:text-left">
            Your Sunshine Valet, Your Time Monetization Platform
          </p>
          <SignInButton mode="modal">
            <button className="mt-2 px-8 py-4 bg-white text-black rounded-full font-semibold text-lg shadow-sm hover:bg-neutral-100 transition-colors duration-200 text-left">
              Experience SunSpec Now
            </button>
          </SignInButton>
        </div>
        {/* Right side: empty for now, just for layout balance */}
        <div className="hidden md:block w-1/2"></div>
      </main>
    </div>
  )
}
