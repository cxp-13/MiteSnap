'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Qwen } from '@lobehub/icons'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

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

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  { ssr: false }
);

export default function Home() {
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  // Anchor positioning refs
  const featuresRef = useRef<HTMLDivElement | null>(null)
  const faqRef = useRef<HTMLDivElement | null>(null)
  const pricingRef = useRef<HTMLDivElement | null>(null)

  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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

  // FAQ data extracted to component scope
  const faqs = [
    {
      q: "What is MiteSnap and what does it offer?",
      a: "MiteSnap is your smart solution for scientifically tracking dust mite conditions in bedding (like duvets, sheets, and pillows) by combining AI visual analysis with real-time weather data. It intelligently monitors the progress and effectiveness of sun-drying your bedding. MiteSnap also features a community helper function, currently allowing you to request sun-drying assistance completely free of charge, with a future update to include a tipping feature for helpers."
    },
    {
      q: "How does MiteSnap's AI analysis work?",
      a: "MiteSnap's analysis leverages the advanced Qwen/Qwen2.5-VL-72B-Instruct multimodal AI model. By integrating this powerful AI with Tomorrow.io's real-time weather data and uploaded photos of your bedding, MiteSnap rapidly analyzes and provides a comprehensive understanding of your bedding's health status."
    },
    {
      q: "What are MiteSnap's pricing plans?",
      a: "MiteSnap's core features are currently completely free to use. We are dedicated to providing accessible solutions for mite-free living. Future updates will introduce premium subscription plans with enhanced features and benefits."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col relative">
      {/* Sticky Navigation Bar */}
      <nav
        className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-[98vw] max-w-[1800px] bg-gray-900/95 backdrop-blur-lg border border-gray-700 shadow-xl flex items-center justify-between px-8 md:px-16 py-4 rounded-[2.5rem] transition-all duration-300"
        style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}
      >
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="MiteSnap Logo" width={32} height={32} className="mr-2" />
          <span className="text-2xl font-bold text-white tracking-wide">MiteSnap</span>
          {/* Nav links group - left, next to logo */}
          <div className="flex items-center space-x-2 ml-4">
            <button onClick={() => scrollToSection(featuresRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">Features</button>
            <button onClick={() => scrollToSection(faqRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">FAQ</button>
            <button onClick={() => scrollToSection(pricingRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">Pricing</button>
          </div>
        </div>
        {/* Spacer for separation */}
        <div className="flex-1" />
        {/* Account/utility links group - right aligned */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="px-6 py-2 rounded-full bg-white text-gray-900 font-semibold text-base shadow hover:bg-gray-100 transition-all">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button onClick={() => router.push('/dashboard')} className="px-5 py-2 rounded-full bg-white text-gray-900 font-semibold text-base shadow hover:bg-gray-100 transition-all">Dashboard</button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      {/* Spacer to prevent content overlap */}
      <div className="h-28" />
      
      
      {/* Hero Section - Full viewport height with perfect centering */}
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-2 md:px-4 relative z-10">
        <div className="max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1400px] mx-auto text-center space-y-12">
          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-light text-black leading-[0.9] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, translateY: 30 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Your Smart Solution for<br />
            <span className="text-gray-700">Mite-Free Living</span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl lg:text-3xl font-light text-gray-600 leading-relaxed tracking-[-0.01em] max-w-3xl mx-auto"
            initial={{ opacity: 0, translateY: 30 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            Say Goodbye to Dust Mites, Hello to Freshness.
          </motion.p>
          
          {/* CTA Button */}
          <div className="pt-8">
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
          </div>
        </div>
      </main>

      {/* Features Section Anchor */}
      <div ref={featuresRef}></div>
      {/* Combined Core Features Section */}
      <section className="min-h-screen bg-white py-8 px-2 md:px-4 flex items-center justify-center relative z-10">
        <div className="max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1400px] mx-auto w-full h-full flex flex-col justify-center space-y-8">
          
          {/* AI MiteScan & Insights Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-16 h-1/2">
            {/* Left: Content */}
            <div className="flex-1 lg:text-left text-center">
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black mb-4 tracking-tight"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                AI MiteScan & Insights
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-xl"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                Get precise mite analysis with our{' '}
                <span className="text-purple-600 font-medium">SiliconFlow</span>
                -powered AI visual model, enhanced by Tomorrow.io&apos;s real-time weather data for optimal sun-drying predictions.
              </motion.p>
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
                      {/* Stylized bug/mite icon */}
                      <svg className="w-9 h-9 text-gray-700 group-hover:text-black transition-colors duration-300" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="16" cy="18" rx="7" ry="9" fill="currentColor"/>
                        <ellipse cx="16" cy="11" rx="4" ry="3" fill="currentColor"/>
                        <line x1="16" y1="3" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="8" y1="10" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="24" y1="10" x2="19" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="7" y1="20" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="25" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="10" y1="27" x2="14" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="22" y1="27" x2="18" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-semibold text-black mb-4 tracking-tight"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              >
                Hassle-Free Community Drying
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal max-w-xl"
                initial={{ opacity: 0, translateY: 30 }}
                whileInView={{ opacity: 1, translateY: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              >
                Connect instantly with verified neighbors for convenient duvet drying. Our location matching finds helpers within a 5km radius for reliable support.
              </motion.p>
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

      {/* FAQ Section Anchor */}
      <div ref={faqRef}></div>
      <section className="bg-white py-12 px-2 md:px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-[900px] mx-auto w-full">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-semibold text-black mb-4"
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif' }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600" 
              style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif' }}
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Everything you need to know about MiteSnap and our services
            </motion.p>
          </div>
          {/* Modern Accordion FAQ */}
          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFAQ === idx
              return (
                <div key={idx} className={`border rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md ${
                  isOpen ? 'border-gray-300 shadow-md' : 'border-gray-200'
                }`}>
                  <div
                    onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                    className={`w-full px-8 py-6 text-left flex items-center justify-between group cursor-pointer transition-all duration-300 ${
                      isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif' }}
                  >
                    <h3 className={`text-lg font-semibold pr-6 transition-all duration-300 select-text ${
                      isOpen ? 'text-black' : 'text-gray-900 group-hover:text-black'
                    }`}>
                      {item.q}
                    </h3>
                    <span className="ml-2 flex items-center flex-shrink-0">
                      <svg className={`w-5 h-5 transition-all duration-500 ease-out transform ${
                        isOpen ? 'rotate-180 text-black' : 'text-gray-400 group-hover:text-gray-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  <div className={`overflow-hidden transition-all duration-500 ease-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-8 pb-8 pt-2 bg-white border-t border-gray-100">
                      <div className="pt-4">
                        <p className="text-gray-700 leading-[1.75] text-base select-text" style={{ 
                          fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif',
                          letterSpacing: '0.01em'
                        }}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section Anchor */}
      <div ref={pricingRef}></div>
      {/* Pricing Plans Section */}
      <section className="bg-white py-20 px-2 md:px-4 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-semibold text-black mb-4" 
              style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif' }}
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Pricing Plans
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600" 
              style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif' }}
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Choose the plan that fits your needs. Upgrade anytime.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Plan Card */}
            <motion.div 
              className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm p-8 items-center"
              initial={{ opacity: 0, translateY: 50 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            >
              <span className="text-xl font-bold text-black mb-1">Basic</span>
              <span className="text-3xl font-extrabold text-black mb-2">$0 <span className="text-base font-medium text-gray-500">/ Forever Free</span></span>
              <span className="text-base text-gray-500 mb-6">Essential tools for initial tracking.</span>
              <ul className="w-full space-y-4 mb-8">
                <li className="flex items-center text-gray-800"><span className="mr-3">✔️</span>Manage 1 Duvet Profile</li>
                <li className="flex items-center text-gray-800"><span className="mr-3">✔️</span>Unlimited AI MiteScan Analysis & Self-Drying Recommendations</li>
                <li className="flex items-center text-gray-800"><span className="mr-3">✔️</span>Unlimited Community Drying Request Submissions</li>
              </ul>
            </motion.div>
            {/* Pro Plan Card */}
            <motion.div 
              className="flex flex-col rounded-2xl border-2 border-gray-900 bg-gray-50 shadow-lg p-8 items-center relative"
              initial={{ opacity: 0, translateY: 50 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1 rounded-full shadow">Highly Recommended</span>
              <span className="text-xl font-bold text-black mb-1">Pro</span>
              <span className="text-3xl font-extrabold text-black mb-2">$3.9 <span className="text-base font-medium text-gray-500">/ month</span></span>
              <span className="text-base text-gray-500 mb-6">Unlock advanced capabilities for comprehensive care.</span>
              <ul className="w-full space-y-4 mb-8">
                <li className="flex items-center text-gray-900"><span className="mr-3">⭐</span>Manage up to 5 Duvet Profiles</li>
                <li className="flex items-center text-gray-900"><span className="mr-3">⭐</span>Ability to Accept Drying Requests from others (unlimited, with tipping & visibility boost)</li>
                <li className="flex items-center text-gray-900"><span className="mr-3">⭐</span>All other features are identical to the Basic Plan</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-gray-400 text-white font-semibold text-lg shadow cursor-not-allowed" disabled>Coming Soon</button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}