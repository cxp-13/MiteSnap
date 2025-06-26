'use client'

import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useMockUser } from '@/context/MockUserContext'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'

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
      {/* 顶部 Logo 和导航栏 */}
      <Header />
      {/* 主体内容居中 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-black mb-6 mt-8 text-center tracking-tight">Breathe Easy. Live Clean.</h1>
        <p className="text-lg md:text-2xl font-semibold text-gray-500 mb-12 text-center">AI-powered dust mite & duvet care.</p>
        
        {isMockMode ? (
          // Mock mode UI
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
          // Clerk UI
          <>
            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition">Get Started</button>
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
      </main>
    </div>
  )
}