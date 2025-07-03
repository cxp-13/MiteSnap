'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Qwen } from '@lobehub/icons'
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
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const handleGetStarted = () => {
    if (isMockMode) {
      signIn()
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  useEffect(() => {
    const setupRoleSwapAnimations = () => {
      const helperDiv = document.querySelector('[data-role="helper"]') as HTMLElement
      const youDiv = document.querySelector('[data-role="you"]') as HTMLElement
      const helperLabel = document.getElementById('helper-label') as HTMLElement
      const youLabel = document.getElementById('you-label') as HTMLElement
      const helperContainer = document.getElementById('helper-container') as HTMLElement
      const youContainer = document.getElementById('you-container') as HTMLElement
      const helperIcon = document.getElementById('helper-icon') as HTMLElement
      const youIcon = document.getElementById('you-icon') as HTMLElement

      if (!helperDiv || !youDiv || !helperLabel || !youLabel || !helperContainer || !youContainer || !helperIcon || !youIcon) {
        console.log('Missing elements for role swap animation')
        return
      }

      // State to track if roles are currently swapped
      let isSwapped = false

      // Universal function to safely set class on any element
      const setElementClass = (element: HTMLElement, className: string) => {
        if (!element) return
        try {
          element.setAttribute('class', className)
        } catch (e) {
          console.warn('Failed to set class on element:', element, e)
        }
      }

      const applyGreyTheme = (container: HTMLElement, icon: HTMLElement, label: HTMLElement) => {
        setElementClass(container, 'w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg')
        setElementClass(icon, 'w-8 h-8 text-gray-600 transition-colors duration-300')
        setElementClass(label, 'text-xs font-medium text-gray-600 transition-colors duration-300')
      }

      const applyWhiteTheme = (container: HTMLElement, icon: HTMLElement, label: HTMLElement) => {
        setElementClass(container, 'w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg')
        setElementClass(icon, 'w-8 h-8 text-gray-700 transition-colors duration-300')
        setElementClass(label, 'text-xs font-medium text-gray-700 transition-colors duration-300')
      }

      const setOriginalState = () => {
        // Helper: Grey theme + "Helper" label
        applyGreyTheme(helperContainer, helperIcon, helperLabel)
        if (helperLabel && helperLabel.textContent !== undefined) {
          helperLabel.textContent = 'Helper'
        }
        
        // You: White theme + "You" label
        applyWhiteTheme(youContainer, youIcon, youLabel)
        if (youLabel && youLabel.textContent !== undefined) {
          youLabel.textContent = 'You'
        }
      }

      const setSwappedState = () => {
        // Helper becomes You (white theme)
        applyWhiteTheme(helperContainer, helperIcon, helperLabel)
        if (helperLabel && helperLabel.textContent !== undefined) {
          helperLabel.textContent = 'You'
        }
        
        // You becomes Helper (grey theme)
        applyGreyTheme(youContainer, youIcon, youLabel)
        if (youLabel && youLabel.textContent !== undefined) {
          youLabel.textContent = 'Helper'
        }
      }

      const handleRoleToggle = () => {
        if (isSwapped) {
          // Currently swapped, return to original
          setOriginalState()
          isSwapped = false
        } else {
          // Currently original, swap roles
          setSwappedState()
          isSwapped = true
        }
      }

      helperDiv.addEventListener('mouseenter', handleRoleToggle)
      youDiv.addEventListener('mouseenter', handleRoleToggle)

      return () => {
        helperDiv.removeEventListener('mouseenter', handleRoleToggle)
        youDiv.removeEventListener('mouseenter', handleRoleToggle)
      }
    }

    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const cleanup = setupRoleSwapAnimations()
      return cleanup
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const faqs = [
    {
      question: "What is MiteSnap?",
      answer: "MiteSnap is a comprehensive bedding management software that scientifically monitors dust mite conditions in your duvets and bedding. Our platform combines AI-powered analysis with community-based drying assistance services to help you maintain optimal hygiene and health in your bedroom environment."
    },
    {
      question: "How does the AI analysis work?",
      answer: "Our system uses Qwen's advanced visual AI model to analyze photos of your duvets, combined with real-time weather data from Tomorrow.io. The AI evaluates factors like material type, environmental conditions, and visual indicators to provide scientific assessments of dust mite levels and predict the effectiveness of sun-drying sessions."
    },
    {
      question: "What is the community drying service?",
      answer: "Our innovative community service connects you with helpful neighbors within a 5km radius who can assist with duvet drying when you're unable to do it yourself. Simply create a service request, and nearby MiteSnap users will be notified and can accept your request to help with the drying process."
    },
    {
      question: "Is the service safe and reliable?",
      answer: "Yes, safety is our top priority. All users go through verification processes, and we provide detailed profiles and ratings for community helpers. You can view helper profiles, read reviews, and communicate through our secure platform before accepting assistance."
    },
    {
      question: "How accurate is the dust mite monitoring?",
      answer: "Our AI analysis combines multiple data points including visual assessment, material properties, environmental conditions, and historical patterns to provide highly accurate dust mite risk assessments. The system continuously learns and improves its predictions based on real-world outcomes."
    },
    {
      question: "What devices can I use MiteSnap on?",
      answer: "MiteSnap is a web-based platform that works on any device with a modern browser - smartphones, tablets, laptops, and desktop computers. Simply access our website and start managing your bedding hygiene from anywhere."
    },
    {
      question: "How much does MiteSnap cost?",
      answer: "MiteSnap offers a free tier with basic monitoring features. Premium plans include advanced AI analysis, unlimited community service requests, detailed health reports, and priority support. Check our pricing page for current rates and features."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Simply sign up for a free account, add your first duvet by taking a photo, and let our AI analyze its condition. You can immediately start tracking your bedding hygiene and access our community drying services."
    }
  ]

  return (
    <div className="min-h-screen w-full bg-white flex flex-col relative">
      {/* Subtle digital noise texture background */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.4) 0.5px, transparent 0.5px),
            radial-gradient(circle at 3px 3px, rgba(156, 163, 175, 0.3) 0.3px, transparent 0.3px),
            radial-gradient(circle at 5px 5px, rgba(156, 163, 175, 0.2) 0.2px, transparent 0.2px)
          `,
          backgroundSize: '8px 8px, 12px 12px, 16px 16px',
          backgroundPosition: '0 0, 2px 2px, 4px 4px'
        }}
      ></div>
      
      {/* Additional fine grain overlay for tactile feel */}
      <div 
        className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(156, 163, 175, 0.1) 1px,
              rgba(156, 163, 175, 0.1) 2px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(156, 163, 175, 0.1) 1px,
              rgba(156, 163, 175, 0.1) 2px
            )
          `,
          backgroundSize: '4px 4px'
        }}
      ></div>
      
      {/* Header */}
      <Header />
      
      {/* Hero Section - Full viewport height with perfect centering */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-black leading-[0.9] tracking-[-0.02em] mb-8">
            Your Smart Solution for<br />
            <span className="text-gray-700">Mite-Free Living</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-600 leading-relaxed tracking-[-0.01em] max-w-3xl mx-auto">
            Say Goodbye to Dust Mites, Hello to Freshness.
          </p>
          
          {/* CTA Button */}
          <div className="pt-8">
            {isMockMode ? (
              <>
                {!isSignedIn ? (
                  <button 
                    onClick={handleGetStarted}
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-black rounded-none border-2 border-black transition-all duration-300 ease-out hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-black rounded-none border-2 border-black transition-all duration-300 ease-out hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
                  >
                    <span className="relative z-10">Go to Dashboard</span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                  </button>
                )}
              </>
            ) : (
              <>
                <SignedOut>
                  <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                    <button className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-black rounded-none border-2 border-black transition-all duration-300 ease-out hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50">
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                    </button>
                  </SignInButton>
                </SignedOut>
                
                <SignedIn>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-medium text-white bg-black rounded-none border-2 border-black transition-all duration-300 ease-out hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50"
                  >
                    <span className="relative z-10">Go to Dashboard</span>
                    <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></div>
                  </button>
                </SignedIn>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Combined Core Features Section */}
      <section className="min-h-screen bg-white py-8 px-6 flex items-center justify-center relative z-10">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center space-y-8">
          
          {/* AI MiteScan & Insights Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-16 h-1/2">
            {/* Left: Content */}
            <div className="flex-1 lg:text-left text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black mb-4 tracking-tight">
                AI MiteScan & Insights
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-xl">
                Get precise mite analysis with our{' '}
                <span className="text-purple-600 font-medium">SiliconFlow</span>
                -powered AI visual model, enhanced by Tomorrow.io's real-time weather data for optimal sun-drying predictions.
              </p>
            </div>
            
            {/* Right: Enhanced Workflow Diagram */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-5 gap-2 items-center">
                  {/* Dual Inputs Column */}
                  <div className="flex flex-col space-y-3">
                    {/* Duvet Photos */}
                    <div className="flex flex-col items-center space-y-2 group cursor-pointer">
                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200 group-hover:border-gray-400 group-hover:bg-white group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                        <svg className="w-7 h-7 text-gray-700 group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors duration-300">Duvet Photos</span>
                    </div>

                    {/* Weather Data */}
                    <div className="flex flex-col items-center space-y-2 group cursor-pointer">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:border-gray-500 group-hover:bg-gray-50 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                        <svg className="w-7 h-7 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-800 transition-colors duration-300">Weather Data</span>
                    </div>
                  </div>

                  {/* Converging Flow Lines */}
                  <div className="flex flex-col items-center justify-center space-y-4 relative -mx-1">
                    {/* Top curved line */}
                    <div className="relative w-16 h-8">
                      <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
                        <path 
                          d="M2 8 Q32 2 60 16" 
                          stroke="rgb(107 114 128)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          strokeDasharray="4 3"
                          className="opacity-80"
                        />
                        <circle 
                          cx="60" 
                          cy="16" 
                          r="2" 
                          fill="rgb(107 114 128)" 
                          className="opacity-90"
                        />
                      </svg>
                    </div>
                    
                    {/* Bottom curved line */}
                    <div className="relative w-16 h-8">
                      <svg className="w-full h-full" viewBox="0 0 64 32" fill="none">
                        <path 
                          d="M2 24 Q32 30 60 16" 
                          stroke="rgb(107 114 128)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          strokeDasharray="4 3"
                          className="opacity-80"
                        />
                        <circle 
                          cx="60" 
                          cy="16" 
                          r="2" 
                          fill="rgb(107 114 128)" 
                          className="opacity-90"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* AI Processing */}
                  <div className="flex flex-col items-center space-y-2 group cursor-pointer">
                    <div className="w-20 h-16 bg-gradient-to-r from-gray-800 to-black rounded-xl flex items-center justify-center text-white shadow-lg group-hover:from-gray-700 group-hover:to-gray-800 group-hover:scale-105 transition-all duration-300 group-hover:shadow-xl p-3">
                      <div className="flex items-center justify-center w-full h-full">
                        <Qwen.Combine size={22} type={'mono'} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors duration-300">AI Processing</span>
                  </div>

                  {/* Output Flow Line */}
                  <div className="flex items-center justify-center -mx-1">
                    <div className="relative w-12 h-6">
                      <svg className="w-full h-full" viewBox="0 0 48 24" fill="none">
                        <path 
                          d="M2 12 Q24 12 42 12" 
                          stroke="rgb(107 114 128)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          strokeDasharray="5 4"
                          className="opacity-80"
                        />
                        <path 
                          d="M36 8 L44 12 L36 16" 
                          stroke="rgb(107 114 128)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill="none"
                          className="opacity-85"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Mite Analysis Output */}
                  <div className="flex flex-col items-center space-y-2 group cursor-pointer">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:border-gray-500 group-hover:bg-gray-50 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                      {/* Microscopic mite silhouette */}
                      <svg className="w-8 h-8 text-gray-600 group-hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4c-1.5 0-3 .5-4 1.5C7 6.5 6.5 8 6.5 9.5c0 1 .3 2 .8 2.8l-1.8 1.8c-.3.3-.3.8 0 1.1s.8.3 1.1 0l1.8-1.8c.8.5 1.8.8 2.8.8 1.5 0 3-.5 4-1.5 1-1 1.5-2.5 1.5-4s-.5-3-1.5-4c-1-1-2.5-1.5-4-1.5zm0 2c1 0 1.8.3 2.5 1s1 1.5 1 2.5-.3 1.8-1 2.5-1.5 1-2.5 1-1.8-.3-2.5-1-1-1.5-1-2.5.3-1.8 1-2.5 1.5-1 2.5-1z"/>
                        <circle cx="12" cy="9.5" r="1.5"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-black transition-colors duration-300">Mite Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200"></div>

          {/* Community Drying Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-16 h-1/2">
            {/* Left: Content */}
            <div className="flex-1 lg:text-left text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black mb-4 tracking-tight">
                Hassle-Free Community Drying
              </h2>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-xl">
                Connect instantly with verified neighbors for convenient duvet drying. Our location matching finds helpers within a 5km radius for reliable support.
              </p>
            </div>
            
            {/* Right: Enhanced Community Diagram */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center space-x-8" id="community-diagram">
                {/* Helper */}
                <div className="flex flex-col items-center space-y-2 group cursor-pointer" data-role="helper">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg" id="helper-container">
                      <svg className="w-8 h-8 text-gray-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="helper-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 transition-colors duration-300" id="helper-label">Helper</span>
                </div>

                {/* 5KM Connection with Pulse Animation */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative w-20 h-20 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-gray-700">5KM</span>
                    {/* Removed crossed elements as requested */}
                  </div>
                  <span className="text-xs font-medium text-gray-700">Radius</span>
                </div>

                {/* You */}
                <div className="flex flex-col items-center space-y-2 group cursor-pointer" data-role="you">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border-2 border-gray-300 group-hover:scale-105 transition-all duration-300 group-hover:shadow-lg" id="you-container">
                      <svg className="w-8 h-8 text-gray-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="you-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-600 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 transition-colors duration-300" id="you-label">You</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-black mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about MiteSnap and our services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <h3 className="text-lg font-semibold text-black pr-4">
                    {faq.question}
                  </h3>
                  <div className={`transform transition-transform duration-200 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA in FAQ Section */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Still have questions? We&apos;re here to help!
            </p>
            {isMockMode ? (
              <>
                {!isSignedIn ? (
                  <button 
                    onClick={handleGetStarted}
                    className="px-8 py-3 rounded-full bg-black text-white font-bold text-lg shadow-md hover:bg-gray-900 transition"
                  >
                    Try MiteSnap Now (Demo)
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
                      Try MiteSnap Now
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
      </section>
    </div>
  )
}