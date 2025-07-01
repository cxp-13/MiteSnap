'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useMockUser } from '@/context/MockUserContext'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import dynamic from 'next/dynamic'

// Dynamically import Clerk components with SSR disabled
const SignInButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignInButton),
  { ssr: false }
);

const SignedIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignedIn),
  { ssr: false }
);

const SignedOut = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignedOut),
  { ssr: false }
);

export default function Home() {
  const router = useRouter()
  const { isMockMode, signIn } = useMockUser()
  const { isSignedIn } = useUnifiedUser()

  const handleGetStarted = () => {
    if (isMockMode) {
      signIn()
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold text-black mb-6 tracking-tight">
            Breathe Easy. Live Clean.
          </h1>
          <p className="text-lg md:text-2xl font-semibold text-gray-500 mb-12">
            AI-powered dust mite & duvet care.
          </p>
          
          {/* CTA Button */}
          <div className="mb-16">
            {isMockMode ? (
              <>
                {!isSignedIn ? (
                  <button 
                    onClick={handleGetStarted}
                    className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition"
                  >
                    Get Started (Demo)
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition"
                  >
                    Go to Dashboard
                  </button>
                )}
              </>
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                    <button className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition">
                      Get Started
                    </button>
                  </SignInButton>
                </SignedOut>
                
                <SignedIn>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition"
                  >
                    Go to Dashboard
                  </button>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Value Proposition Section */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Why Choose MiteSnap?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Revolutionary AI technology meets community-powered service for the ultimate duvet care experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Highlight 1: AI Analysis */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-black">
                  AI-Powered Mite Analysis
                </h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Powered by Qwen's advanced visual AI model combined with real-time weather data from Tomorrow.io. 
                Our intelligent system analyzes your duvet photos and environmental conditions to scientifically 
                assess dust mite levels and predict optimal sun-drying effectiveness.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Qwen Visual AI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Weather Integration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Scientific Analysis</span>
                </div>
              </div>
            </div>

            {/* Highlight 2: Community Service */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-2xl font-bold text-black">
                  Community Drying Service
                </h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Can't dry your duvet yourself? Our innovative community service instantly connects you with 
                helpful neighbors within a 5km radius. Every platform user can assist with duvet drying, 
                creating a supportive local network for better home hygiene.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>5km Radius</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Instant Matching</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Community Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Smart Tracking</h4>
              <p className="text-gray-600">
                Monitor every sun-drying session with detailed effectiveness reports and mite reduction analytics
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌤️</span>
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Weather Optimization</h4>
              <p className="text-gray-600">
                Get real-time recommendations for optimal drying conditions based on local weather patterns
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏠</span>
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Healthier Home</h4>
              <p className="text-gray-600">
                Reduce allergens and improve sleep quality with scientifically-optimized duvet maintenance
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}