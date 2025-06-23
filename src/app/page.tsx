'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-lg text-orange-400 animate-pulse">Loading...</div>
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
      {/* Cyberpunk Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Header />
      
      {/* Main Content Container */}
      <main className="flex min-h-screen relative z-10">
        {/* Left Column - Content (40%) */}
        <div className="w-2/5 flex flex-col justify-center items-start px-16 relative">
          <div className="max-w-lg">
            {/* Enhanced SunSpec Title with Volumetric Glow */}
            <h1 className="sunspec-title-enhanced mb-8">
              <span className="title-main">SunSpec</span>
              <span className="title-glow">SunSpec</span>
              <span className="title-particles"></span>
            </h1>
            
            {/* Enhanced Slogan */}
            <p className="sunspec-slogan-enhanced mb-12">
              Your Sunshine Valet, Your Time Monetization Platform
            </p>
            
            {/* Premium CTA Button */}
            <SignInButton mode="modal">
              <button className="cta-button-premium">
                <span className="button-text">Experience SunSpec Now</span>
                <div className="button-glass-overlay"></div>
                <div className="button-glow-enhanced"></div>
                <div className="button-particles"></div>
              </button>
            </SignInButton>
          </div>
        </div>

        {/* Right Column - Enhanced Animation Grid (60%) */}
        <div className="w-3/5 relative flex items-center justify-center">
          {/* Grid Container with Cyberpunk Effects */}
          <div className="grid-container">
            <div className="grid-glow-overlay"></div>
            <div className="dust-mite-grid-enhanced">
              {Array.from({ length: 81 }, (_, i) => {
                const row = Math.floor(i / 9)
                const col = i % 9
                const delay = (row + col) * 0.15
                
                return (
                  <div 
                    key={i} 
                    className="grid-cell-enhanced" 
                    style={{ 
                      animationDelay: `${delay}s`,
                      '--cell-index': i 
                    }}
                  >
                    {/* Dust Mite Icon */}
                    <div className="dust-mite-icon-enhanced">
                      <svg viewBox="0 0 32 32" className="w-8 h-8">
                        <ellipse cx="16" cy="16" rx="8" ry="6" fill="currentColor" opacity="0.8"/>
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
                        <path d="M8 16 L6 14 M8 18 L6 20 M24 16 L26 14 M24 18 L26 20" stroke="currentColor" strokeWidth="1"/>
                        <path d="M16 22 L14 26 M16 22 L18 26" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                    </div>
                    
                    {/* Health Icon */}
                    <div className="health-icon-enhanced">
                      <svg viewBox="0 0 32 32" className="w-8 h-8">
                        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8"/>
                        <path d="M10 16 L14 20 L22 12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                        <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.6"/>
                      </svg>
                    </div>
                    
                    {/* Particle Effects */}
                    <div className="cell-particles">
                      {Array.from({ length: 6 }, (_, pi) => (
                        <div key={pi} className="particle" style={{ '--particle-index': pi }}></div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}