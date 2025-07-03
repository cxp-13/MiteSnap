'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useMockUser } from '@/context/MockUserContext'
import { useUnifiedUser } from '@/hooks/useUnifiedUser'
import dynamic from 'next/dynamic'
import { useState } from 'react'

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
    <div className="min-h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Hero Section - Full viewport height */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
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
                Powered by Qwen&apos;s advanced visual AI model combined with real-time weather data from Tomorrow.io. 
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
                Can&apos;t dry your duvet yourself? Our innovative community service instantly connects you with 
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