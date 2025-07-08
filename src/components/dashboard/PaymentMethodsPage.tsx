'use client'

import { useState, useEffect } from 'react'
import { usePaymentMethods } from '@/hooks/dashboard/usePaymentMethods'

interface PaymentMethodsPageProps {
  userId: string
}

export default function PaymentMethodsPage({ userId }: PaymentMethodsPageProps) {
  const { primaryPaymentMethod, isLoading, handleCreatePaymentMethod, handleUpdatePaymentMethod } = usePaymentMethods(userId)
  
  const [isEditing, setIsEditing] = useState(false)
  const [venmoHandle, setVenmoHandle] = useState('')
  const [cashappUsername, setCashappUsername] = useState('')
  const [paypalUsername, setPaypalUsername] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Helper function to extract username from Cash App URL
  const extractCashappUsername = (url: string | null): string => {
    if (!url) return ''
    const match = url.match(/https:\/\/cash\.app\/\$(.+)/)
    return match ? match[1] : ''
  }

  // Helper function to extract username from PayPal URL
  const extractPaypalUsername = (url: string | null): string => {
    if (!url) return ''
    const match = url.match(/https:\/\/paypal\.me\/(.+)/)
    return match ? match[1] : ''
  }

  // Initialize form with existing data
  useEffect(() => {
    if (primaryPaymentMethod) {
      setVenmoHandle(primaryPaymentMethod.venmo_handle || '')
      setCashappUsername(extractCashappUsername(primaryPaymentMethod.cashapp_url))
      setPaypalUsername(extractPaypalUsername(primaryPaymentMethod.paypal_url))
    }
  }, [primaryPaymentMethod])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let success = false
      
      // Construct full URLs from usernames
      const cashappUrl = cashappUsername ? `https://cash.app/$${cashappUsername}` : null
      const paypalUrl = paypalUsername ? `https://paypal.me/${paypalUsername}` : null
      
      if (primaryPaymentMethod) {
        // Update existing payment method
        success = await handleUpdatePaymentMethod(
          primaryPaymentMethod.id,
          venmoHandle || null,
          cashappUrl,
          paypalUrl
        )
      } else {
        // Create new payment method
        success = await handleCreatePaymentMethod(
          venmoHandle || null,
          cashappUrl,
          paypalUrl
        )
      }
      
      if (success) {
        setIsEditing(false)
      } else {
        alert('Failed to save payment methods. Please try again.')
      }
    } catch (error) {
      console.error('Error saving payment methods:', error)
      alert('Failed to save payment methods. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    if (primaryPaymentMethod) {
      setVenmoHandle(primaryPaymentMethod.venmo_handle || '')
      setCashappUsername(extractCashappUsername(primaryPaymentMethod.cashapp_url))
      setPaypalUsername(extractPaypalUsername(primaryPaymentMethod.paypal_url))
    } else {
      setVenmoHandle('')
      setCashappUsername('')
      setPaypalUsername('')
    }
    setIsEditing(false)
  }

  // Icon components
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  const XIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading payment methods...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
          Payment Methods
        </h1>
        <p className="text-lg text-gray-600">
          Pay directly to our helper before the service starts
        </p>
      </div>

      <div className="space-y-8">
        {/* Current Payment Methods Display */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Payment Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="mr-3">
                {primaryPaymentMethod?.venmo_handle ? <CheckIcon /> : <XIcon />}
              </div>
              <span className="font-medium text-gray-700 w-20">Venmo:</span>
              <span className="ml-2 text-gray-900">
                {primaryPaymentMethod?.venmo_handle ? `@${primaryPaymentMethod.venmo_handle}` : 'Not set'}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="mr-3">
                {primaryPaymentMethod?.cashapp_url ? <CheckIcon /> : <XIcon />}
              </div>
              <span className="font-medium text-gray-700 w-20">Cash App:</span>
              <span className="ml-2 text-gray-900">
                {primaryPaymentMethod?.cashapp_url || 'Not set'}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="mr-3">
                {primaryPaymentMethod?.paypal_url ? <CheckIcon /> : <XIcon />}
              </div>
              <span className="font-medium text-gray-700 w-20">PayPal:</span>
              <span className="ml-2 text-gray-900">
                {primaryPaymentMethod?.paypal_url || 'Not set'}
              </span>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {primaryPaymentMethod ? 'Edit Payment Methods' : 'Add Payment Methods'}
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {primaryPaymentMethod ? 'Edit Payment Methods' : 'Add Payment Methods'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="venmo" className="block text-sm font-medium text-gray-700 mb-1">
                  Venmo Username (without @)
                </label>
                <input
                  type="text"
                  id="venmo"
                  value={venmoHandle}
                  onChange={(e) => setVenmoHandle(e.target.value)}
                  placeholder="duvetqueen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Example: duvetqueen</p>
              </div>

              <div>
                <label htmlFor="cashapp" className="block text-sm font-medium text-gray-700 mb-1">
                  Cash App Username
                </label>
                <div className="flex group">
                  <span className="flex items-center text-gray-700 text-sm bg-gray-100 px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-300 group-focus-within:border-black">https://cash.app/$</span>
                  <input
                    type="text"
                    id="cashapp"
                    value={cashappUsername}
                    onChange={(e) => setCashappUsername(e.target.value)}
                    placeholder="duvetqueen"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-0 focus:border-black text-gray-900 placeholder-gray-500 h-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: duvetqueen</p>
              </div>

              <div>
                <label htmlFor="paypal" className="block text-sm font-medium text-gray-700 mb-1">
                  PayPal Username
                </label>
                <div className="flex group">
                  <span className="flex items-center text-gray-700 text-sm bg-gray-100 px-3 py-2.5 rounded-l-lg border border-r-0 border-gray-300 group-focus-within:border-black">https://paypal.me/</span>
                  <input
                    type="text"
                    id="paypal"
                    value={paypalUsername}
                    onChange={(e) => setPaypalUsername(e.target.value)}
                    placeholder="duvetqueen"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-0 focus:border-black text-gray-900 placeholder-gray-500 h-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: duvetqueen</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}