import { useState, useEffect, useCallback } from 'react'
import { createOrder, getUserOrders, getNearbyOrders, updateOrderStatus, deleteOrder, type Order } from '@/lib/database'

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [nearbyOrders, setNearbyOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  // Load user's orders
  const loadOrders = useCallback(async () => {
    if (!userId) return
    
    setIsLoadingOrders(true)
    try {
      const [userOrders, nearby] = await Promise.all([
        getUserOrders(userId),
        getNearbyOrders(userId)
      ])
      
      setOrders(userOrders)
      setNearbyOrders(nearby)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoadingOrders(false)
    }
  }, [userId])

  // Load orders on mount and when userId changes
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Create a new order
  const handleCreateOrder = useCallback(async (
    duvetId: string,
    addressId: string,
    serviceType: string,
    placedPhoto?: string
  ) => {
    if (!userId) return false

    try {
      const success = await createOrder(userId, duvetId, addressId, serviceType, placedPhoto)
      if (success) {
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating order:', error)
      return false
    }
  }, [userId, loadOrders])

  // Update order status
  const handleUpdateOrderStatus = useCallback(async (
    orderId: string,
    status: string,
    helperId?: string
  ) => {
    try {
      const success = await updateOrderStatus(orderId, status, helperId)
      if (success) {
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }, [loadOrders])

  // Delete order
  const handleDeleteOrder = useCallback(async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return false
    }

    try {
      const success = await deleteOrder(orderId)
      if (success) {
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }, [loadOrders])

  // Accept a nearby order
  const handleAcceptOrder = useCallback(async (orderId: string) => {
    if (!userId) return false

    if (!confirm('Do you want to accept this service request?')) {
      return false
    }

    try {
      const success = await updateOrderStatus(orderId, 'accepted', userId)
      if (success) {
        await loadOrders()
        alert('Service request accepted! The requester will be notified.')
        return true
      }
      return false
    } catch (error) {
      console.error('Error accepting order:', error)
      return false
    }
  }, [userId, loadOrders])

  return {
    // State
    orders,
    nearbyOrders,
    isLoadingOrders,
    
    // Actions
    loadOrders,
    handleCreateOrder,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    handleAcceptOrder
  }
}