import { useState, useEffect, useCallback } from 'react'
import { 
  createPaymentMethod, 
  getUserPaymentMethods, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  type PaymentMethod 
} from '@/lib/database'

export function usePaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load user's payment methods
  const loadPaymentMethods = useCallback(async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const methods = await getUserPaymentMethods(userId)
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  // Create a new payment method
  const handleCreatePaymentMethod = useCallback(async (
    venmoHandle?: string | null,
    cashappUrl?: string | null,
    paypalUrl?: string | null
  ) => {
    if (!userId) return false

    try {
      const paymentMethod = await createPaymentMethod(userId, venmoHandle, cashappUrl, paypalUrl)
      if (paymentMethod) {
        await loadPaymentMethods()
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating payment method:', error)
      return false
    }
  }, [userId, loadPaymentMethods])

  // Update an existing payment method
  const handleUpdatePaymentMethod = useCallback(async (
    paymentMethodId: string,
    venmoHandle?: string | null,
    cashappUrl?: string | null,
    paypalUrl?: string | null
  ) => {
    try {
      const updatedMethod = await updatePaymentMethod(paymentMethodId, venmoHandle, cashappUrl, paypalUrl)
      if (updatedMethod) {
        await loadPaymentMethods()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating payment method:', error)
      return false
    }
  }, [loadPaymentMethods])

  // Delete a payment method
  const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return false
    }

    try {
      const success = await deletePaymentMethod(paymentMethodId)
      if (success) {
        await loadPaymentMethods()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting payment method:', error)
      return false
    }
  }, [loadPaymentMethods])

  // Get the first (most recent) payment method or null
  const primaryPaymentMethod = paymentMethods.length > 0 ? paymentMethods[0] : null

  return {
    // State
    paymentMethods,
    primaryPaymentMethod,
    isLoading,
    
    // Actions
    loadPaymentMethods,
    handleCreatePaymentMethod,
    handleUpdatePaymentMethod,
    handleDeletePaymentMethod
  }
}