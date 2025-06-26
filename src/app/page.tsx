'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/Header'
import Logo from '@/components/Logo'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, isLoaded, router])
  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* 顶部 Logo 和导航栏 */}
      <Header />
      {/* 主体内容居中 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* <Logo /> */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-black mb-6 mt-8 text-center tracking-tight">Breathe Easy. Live Clean.</h1>
        <p className="text-lg md:text-2xl font-semibold text-gray-500 mb-12 text-center">AI-powered dust mite & duvet care.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
          <button className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition">Get Started</button>
        </SignInButton>
      </main>
    </div>
  )
}