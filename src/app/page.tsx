'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import UserProfile from '@/components/auth/UserProfile'

export default function Home() {
  const { user, loading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SunSpec Project
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern web application built with Next.js and Supabase authentication.
            Sign up or log in to get started.
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-md mx-auto">
          {user ? (
            <div className="space-y-6">
              <UserProfile />
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Welcome to SunSpec!</h2>
                <p className="text-gray-600">
                  You are successfully logged in. This is a simple landing page to test 
                  the authentication functionality.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="mb-6">
                <div className="flex space-x-1 mb-4">
                  <button
                    onClick={() => setShowRegister(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      !showRegister
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      showRegister
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              
              {showRegister ? <RegisterForm /> : <LoginForm />}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>&copy; 2024 SunSpec Project. Built with Next.js and Supabase.</p>
        </footer>
      </div>
    </div>
  )
}
