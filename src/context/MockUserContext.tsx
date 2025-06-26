'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MockUser {
  id: string
  name: string
  email: string
}

interface MockUserContextType {
  isMockMode: boolean
  mockUser: MockUser | null
  isSignedIn: boolean
  isLoaded: boolean
  toggleMockMode: () => void
  signIn: () => void
  signOut: () => void
}

const MockUserContext = createContext<MockUserContextType | undefined>(undefined)

const defaultMockUser: MockUser = {
  id: 'mock-user-123',
  name: 'Demo User',
  email: 'demo@example.com'
}

export function MockUserProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  const toggleMockMode = () => {
    setIsMockMode(prev => !prev)
    if (!isMockMode) {
      setIsSignedIn(true) // Auto sign in when entering mock mode
    } else {
      setIsSignedIn(false) // Sign out when leaving mock mode
    }
  }

  const signIn = () => {
    if (isMockMode) {
      setIsSignedIn(true)
    }
  }

  const signOut = () => {
    setIsSignedIn(false)
  }

  const value: MockUserContextType = {
    isMockMode,
    mockUser: isMockMode && isSignedIn ? defaultMockUser : null,
    isSignedIn: isMockMode ? isSignedIn : false,
    isLoaded: true,
    toggleMockMode,
    signIn,
    signOut
  }

  return (
    <MockUserContext.Provider value={value}>
      {children}
    </MockUserContext.Provider>
  )
}

export function useMockUser() {
  const context = useContext(MockUserContext)
  if (context === undefined) {
    throw new Error('useMockUser must be used within a MockUserProvider')
  }
  return context
}