'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Qwen } from '@lobehub/icons'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

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
  
  // Structured Data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MiteSnap",
    "url": "https://mitesnap.com",
    "logo": "https://mitesnap.com/logo.png",
    "description": "AI-powered dust mite detection and bedding health monitoring service",
    "founder": {
      "@type": "Person",
      "name": "lantianlaoli",
      "url": "https://x.com/lantianlaoli"
    },
    "sameAs": [
      "https://x.com/lantianlaoli",
      "https://www.producthunt.com/products/mitesnap"
    ]
  }

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MiteSnap",
    "url": "https://mitesnap.com",
    "description": "Track dust mites on your bedding, sheets, and duvets with AI visual analysis and real-time weather data. Get smart sun-drying recommendations and connect with community helpers.",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with basic features"
    },
    "featureList": [
      "AI-powered dust mite detection",
      "Real-time weather integration",
      "Smart sun-drying recommendations",
      "Community helper network",
      "Bedding health monitoring"
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is MiteSnap and what does it offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MiteSnap is your smart solution for scientifically tracking dust mite conditions in bedding (like duvets, sheets, and pillows) by combining AI visual analysis with real-time weather data. It intelligently monitors the progress and effectiveness of sun-drying your bedding. MiteSnap also features a community helper function, currently allowing you to request sun-drying assistance completely free of charge, with a future update to include a tipping feature for helpers."
        }
      },
      {
        "@type": "Question", 
        "name": "How does MiteSnap's AI analysis work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MiteSnap's analysis leverages the advanced Qwen/Qwen2.5-VL-72B-Instruct multimodal AI model. By integrating this powerful AI with Tomorrow.io's real-time weather data and uploaded photos of your bedding, MiteSnap rapidly analyzes and provides a comprehensive understanding of your bedding's health status."
        }
      },
      {
        "@type": "Question",
        "name": "What are MiteSnap's pricing plans?", 
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MiteSnap's core features are currently completely free to use. We are dedicated to providing accessible solutions for mite-free living. Future updates will introduce premium subscription plans with enhanced features and benefits."
        }
      }
    ]
  }
  
  // Dynamic text switching state
  const dynamicWords = ['Duvets', 'Bed Sheets', 'Bedding']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Anchor positioning refs
  const howItWorksRef = useRef<HTMLDivElement | null>(null)
  const faqRef = useRef<HTMLDivElement | null>(null)
  const pricingRef = useRef<HTMLDivElement | null>(null)

  // Smooth scroll function with proper offset for navigation bar
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const navHeight = 100 // Height of fixed navigation bar + some padding
      const elementPosition = ref.current.offsetTop
      const offsetPosition = elementPosition - navHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Dynamic text switching effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length)
    }, 2000) // Switch every 2 seconds
    
    return () => clearInterval(interval)
  }, [dynamicWords.length])

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
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      
      <div className="min-h-screen w-full bg-white flex flex-col relative">
      {/* Sticky Navigation Bar */}
      <nav
        className="fixed top-3 md:top-6 left-1/2 z-50 -translate-x-1/2 w-[95vw] md:w-[98vw] max-w-[1800px] bg-gray-900/95 backdrop-blur-lg border border-gray-700 shadow-xl flex items-center justify-between px-4 md:px-8 lg:px-16 py-3 md:py-4 rounded-2xl md:rounded-[2.5rem] transition-all duration-300"
        style={{ fontFamily: 'Plus Jakarta Sans, var(--font-plus-jakarta-sans), Segoe UI, Arial, sans-serif', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}
      >
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="MiteSnap - AI-powered dust mite detection app logo" width={28} height={28} className="md:w-8 md:h-8 mr-1 md:mr-2" />
          <span className="text-lg md:text-2xl font-bold text-white tracking-wide">MiteSnap</span>
          {/* Nav links group - left, next to logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 ml-4">
            <button onClick={() => scrollToSection(pricingRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">Pricing</button>
            <button onClick={() => scrollToSection(faqRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">FAQ</button>
            <button onClick={() => scrollToSection(howItWorksRef)} className="text-base font-medium text-gray-300 hover:text-white transition-colors px-3 py-1 rounded focus:outline-none">How it Works</button>
          </div>
        </div>
        {/* Spacer for separation */}
        <div className="flex-1" />
        {/* Account/utility links group - right aligned */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Twitter Contact Link */}
          <a
            href="https://x.com/lantianlaoli"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            title="Follow us on Twitter"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="px-3 md:px-6 py-2 rounded-full bg-white text-gray-900 font-semibold text-sm md:text-base shadow hover:bg-gray-100 transition-all">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button onClick={() => router.push('/dashboard')} className="px-3 md:px-5 py-2 rounded-full bg-white text-gray-900 font-semibold text-sm md:text-base shadow hover:bg-gray-100 transition-all">Dashboard</button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      {/* Spacer to prevent content overlap */}
      <div className="h-20 md:h-28" />
      
      
      {/* Hero Section - Left-Right Split Layout */}
      <main className="min-h-[85vh] flex items-center px-2 md:px-4 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center min-h-[80vh]">
            
            {/* Left Side - Content Area */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-6 md:p-8 lg:p-12">
                {/* Main Headline - H1 for SEO */}
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-black leading-tight tracking-[-0.02em] mb-6"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #374151 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                  initial={{ opacity: 0, translateY: 30 }}
                  whileInView={{ opacity: 1, translateY: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div>
                    {/* Mobile: Two line layout, Desktop: One line layout */}
                    <div className="block sm:hidden">
                      {/* Mobile layout - Two lines */}
                      <div className="mb-2">
                        <span 
                          className="font-bold" 
                          style={{
                            fontFamily: "'Inter', 'SF Pro Display', sans-serif"
                          }}
                        >
                          AI has taken over
                        </span>
                      </div>
                      <div>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={dynamicWords[currentWordIndex]}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeInOut"
                            }}
                            className="font-bold text-black"
                            style={{ 
                              fontFamily: "'Inter', 'SF Pro Display', sans-serif"
                            }}
                          >
                            {dynamicWords[currentWordIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    {/* Desktop layout - One line */}
                    <div className="hidden sm:block">
                      <span 
                        className="font-bold" 
                        style={{
                          fontFamily: "'Inter', 'SF Pro Display', sans-serif"
                        }}
                      >
                        AI has taken over{' '}
                      </span>
                      
                      <span className="inline-block min-w-[200px] md:min-w-[300px] lg:min-w-[400px] text-left">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={dynamicWords[currentWordIndex]}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeInOut"
                            }}
                            className="font-bold text-black"
                            style={{ 
                              fontFamily: "'Inter', 'SF Pro Display', sans-serif"
                            }}
                          >
                            {dynamicWords[currentWordIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                    </div>
                  </div>
                </motion.h1>
                
                {/* Subheading */}
                <motion.p
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-black leading-relaxed tracking-[-0.01em] max-w-3xl mb-8"
                  style={{
                    fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  initial={{ opacity: 0, translateY: 30 }}
                  whileInView={{ opacity: 1, translateY: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  Just <span 
                    className="font-bold relative text-black"
                    style={{
                      textDecoration: 'underline',
                      textDecorationColor: '#000000',
                      textUnderlineOffset: '4px',
                      textDecorationThickness: '2px'
                    }}
                  >
                    take a photo
                  </span>, leave the rest to <span 
                    className="font-bold text-black"
                  >
                    MiteSnap
                  </span>.
                </motion.p>
                
                {/* CTA Button */}
                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, translateY: 30 }}
                  whileInView={{ opacity: 1, translateY: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                >
                  <SignedOut>
                    <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                      <button className="group relative inline-flex items-center justify-center px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 text-base md:text-lg lg:text-xl font-bold text-white bg-gradient-to-r from-gray-900 via-black to-gray-800 rounded-2xl border-2 border-transparent transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-black/30 transform-gpu shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #374151 100%)',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                      }}>
                        <span className="relative z-10 flex items-center space-x-3">
                          <span>Get Started</span>
                          <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-2xl"></div>
                        <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </SignInButton>
                  </SignedOut>
                  
                  <SignedIn>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="group relative inline-flex items-center justify-center px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 text-base md:text-lg lg:text-xl font-bold text-white bg-gradient-to-r from-gray-900 via-black to-gray-800 rounded-2xl border-2 border-transparent transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-black/30 transform-gpu shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #374151 100%)',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                      }}
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <span>Go to Dashboard</span>
                        <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out rounded-2xl"></div>
                      <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </SignedIn>
                </motion.div>
              </div>
            </div>

            {/* Right Side - Scrolling Image Gallery with Blur Edges */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative">
              <motion.div
                className="relative h-[800px] overflow-hidden w-full"
                initial={{ opacity: 0, translateX: 50 }}
                whileInView={{ opacity: 1, translateX: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              >
                {/* Gradient overlays for natural blur edges */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                
                {/* Left Column - Scrolling Up */}
                <div className="absolute left-0 w-[47%] pr-3">
                  <motion.div
                    className="space-y-12"
                    animate={{
                      y: [0, -800]
                    }}
                    transition={{
                      duration: 35,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* First set of images */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-[3/4] relative h-96">
                        <Image
                          src="/duvet1.png"
                          alt="Freshly sun-dried duvet"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-bold">
                            Mite Score: 15
                          </span>
                          <div className="flex text-yellow-400">
                            <span className="text-base">⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 text-sm">Sarah Mitchell</span>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            &ldquo;Incredible! My duvet looked terrible before MiteSnap&rsquo;s analysis. Following their sun-drying recommendations for just one week made such a difference. The AI really knows what it&rsquo;s talking about!&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square relative h-80">
                        <Image
                          src="/duvet3.png"
                          alt="Duvet analysis"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 45
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Very helpful!&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-[4/3] relative h-88">
                        <Image
                          src="/duvet5.png"
                          alt="Bedding health check"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 72
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Early detection!&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Duplicate set for seamless loop */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-[3/4] relative h-96">
                        <Image
                          src="/duvet1.png"
                          alt="Freshly sun-dried duvet"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-bold">
                            Mite Score: 15
                          </span>
                          <div className="flex text-yellow-400">
                            <span className="text-base">⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 text-sm">Sarah Mitchell</span>
                            <span className="text-xs text-gray-500">2 days ago</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            &ldquo;Amazing results! My duvet has never looked better.&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square relative h-80">
                        <Image
                          src="/duvet3.png"
                          alt="Duvet analysis"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 45
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Very helpful!&rdquo;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Scrolling Down */}
                <div className="absolute right-0 w-[47%] pl-3">
                  <motion.div
                    className="space-y-12"
                    style={{ paddingTop: '200px' }}
                    animate={{
                      y: [-800, 0]
                    }}
                    transition={{
                      duration: 35,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* First set of images */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square relative h-80">
                        <Image
                          src="/duvet2.png"
                          alt="Well-maintained duvet"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 32
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Great improvement!&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-[5/3] relative h-72">
                        <Image
                          src="/duvet4.jpg"
                          alt="Duvet requiring attention"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 58
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Issues detected!&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square relative h-80">
                        <Image
                          src="/duvet6.png"
                          alt="Duvet requiring immediate cleaning"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 85
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Action needed!&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Duplicate set for seamless loop */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square relative h-80">
                        <Image
                          src="/duvet2.png"
                          alt="Well-maintained duvet"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 32
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Great improvement!&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-[5/3] relative h-72">
                        <Image
                          src="/duvet4.jpg"
                          alt="Duvet requiring attention"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                            Score: 58
                          </span>
                          <div className="flex text-yellow-400 text-sm">
                            <span>⭐⭐⭐⭐</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-700">
                          &ldquo;Issues detected!&rdquo;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>


      {/* Pricing Plans Section Anchor */}
      <div ref={pricingRef}></div>
      {/* Pricing Plans Section */}
      <section className="bg-white py-8 px-2 md:px-4 flex items-center justify-center min-h-[60vh]" id="pricing" aria-labelledby="pricing-heading">
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <motion.h2 
              id="pricing-heading" 
              className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight"
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Pricing Plans
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600" 
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
              className="flex flex-col rounded-2xl border-2 border-gray-900 bg-gray-50 shadow-xl p-10 items-center relative transform scale-105"
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

      {/* FAQ Section Anchor */}
      <div ref={faqRef}></div>
      <section className="bg-white py-8 px-2 md:px-4 min-h-screen flex items-center justify-center" id="faq" aria-labelledby="faq-heading">
        <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-[900px] mx-auto w-full">
          <div className="text-center mb-8">
            <motion.h2
              id="faq-heading"
              className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight"
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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

      {/* How it Works Section Anchor */}
      <div ref={howItWorksRef}></div>
      {/* How it Works Section */}
      <section className="min-h-screen bg-white py-8 px-2 md:px-4 flex items-center justify-center relative z-10" id="how-it-works" aria-labelledby="how-it-works-heading">
        <div className="max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1400px] mx-auto w-full h-full flex flex-col justify-center space-y-8">
          
          {/* How it Works Title */}
          <div className="text-center mb-6">
            <motion.h2
              id="how-it-works-heading"
              className="text-3xl md:text-4xl font-semibold text-black mb-4 tracking-tight"
              initial={{ opacity: 0, translateY: 30 }}
              whileInView={{ opacity: 1, translateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              How it Works
            </motion.h2>
          </div>
          
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
      </div>

      {/* Fixed Product Hunt Badge - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40">
        <a 
          href="https://www.producthunt.com/products/mitesnap?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mitesnap" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block transition-transform duration-300 hover:scale-105 drop-shadow-lg"
        >
          <Image 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=990814&theme=dark&t=1752123295100" 
            alt="MiteSnap - Track the mites on your bedding, sheets, and other items. | Product Hunt" 
            width={200} 
            height={43}
            unoptimized
          />
        </a>
      </div>
    </>
  )
}