'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-lg text-orange-400">Loading...</div>
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
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <Header />
      
      {/* Main Content Container */}
      <main className="flex min-h-screen">
        {/* Left Column - Content (40%) */}
        <div className="w-2/5 flex flex-col justify-center items-start px-16 relative z-10">
          <div className="max-w-lg">
            <h1 className="sunspec-title mb-8">
              SunSpec
            </h1>
            <p className="sunspec-slogan mb-12">
              Your Sunshine Valet, Your Time Monetization Platform
            </p>
            <SignInButton mode="modal">
              <button className="cta-button">
                <span className="relative z-10">Experience SunSpec Now</span>
                <div className="button-glow"></div>
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Right Column - Animation Grid (60%) */}
        <div className="w-3/5 relative flex items-center justify-center">
          <div className="dust-mite-grid">
            {Array.from({ length: 81 }, (_, i) => (
              <div key={i} className="grid-cell" style={{ animationDelay: `${(i * 0.1) % 8}s` }}>
                <div className="dust-mite-icon">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L12 22l4.5-10c1-1 1.5-2.5 1.5-4 0-3.5-2.5-6-6-6z" fill="currentColor"/>
                    <circle cx="12" cy="8" r="2" fill="rgba(0,0,0,0.3)"/>
                  </svg>
                </div>
                <div className="health-icon">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}