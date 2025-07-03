'use client'

import { useState } from 'react'
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
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const handleGetStarted = () => {
    if (isMockMode) {
      signIn()
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

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

      {/* AI MiteScan & Insights Section */}
      <section className="min-h-screen bg-white py-20 px-6 flex items-center justify-center relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-8 tracking-tight">
            AI MiteScan & Insights
          </h2>
          
          {/* Section Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-16 font-light">
            Get precise mite analysis with our SiliconFlow-powered AI visual model, which scientifically assesses mite levels from your bedding photos. This is enhanced by Tomorrow.io's real-time weather data, predicting optimal sun-drying conditions for maximum effectiveness.
          </p>

          {/* AI Workflow Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12 max-w-5xl mx-auto">
            {/* Input */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Photo Input</span>
            </div>

            {/* Arrow */}
            <div className="hidden md:block">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Processing */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-20 bg-black rounded-lg flex flex-col items-center justify-center text-white">
                <span className="text-xs font-medium">SiliconFlow AI</span>
                <span className="text-xs text-gray-300">Qwen Model</span>
              </div>
              <span className="text-sm font-medium text-gray-700">AI Processing</span>
            </div>

            {/* Plus Weather */}
            <div className="flex items-center space-x-4">
              <span className="text-2xl text-gray-400">+</span>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Weather Data</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:block">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Output */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Mite Analysis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hassle-Free Community Drying Section */}
      <section className="min-h-screen bg-white py-20 px-6 flex items-center justify-center relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-8 tracking-tight">
            Hassle-Free Community Drying
          </h2>
          
          {/* Section Description */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-16 font-light">
            Connect instantly with verified neighbors for convenient duvet drying. Our OpenCage-powered location matching finds the closest helpers within a 5km radius, creating a reliable, supportive network for effortless home hygiene.
          </p>

          {/* Community Interaction Diagram */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-12 md:space-y-0 md:space-x-16 max-w-4xl mx-auto">
            {/* User 1 */}
            <div className="flex flex-col items-center space-y-4 group">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-300">
                  <svg className="w-12 h-12 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* Active indicator */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">Helper</span>
            </div>

            {/* Connection Visualization */}
            <div className="flex flex-col items-center space-y-4">
              {/* 5KM Radius Circle */}
              <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">5KM</span>
                <span className="text-xs text-gray-500 absolute -bottom-6">RADIUS</span>
                
                {/* Connection lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-0.5 bg-gray-300 transform -rotate-45 absolute"></div>
                  <div className="w-16 h-0.5 bg-gray-300 transform rotate-45 absolute"></div>
                </div>
              </div>
            </div>

            {/* User 2 */}
            <div className="flex flex-col items-center space-y-4 group">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300 group-hover:border-green-400 group-hover:bg-green-50 transition-all duration-300">
                  <svg className="w-12 h-12 text-gray-600 group-hover:text-green-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* Active indicator */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">You</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
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