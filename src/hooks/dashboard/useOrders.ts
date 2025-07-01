import { useState, useEffect, useCallback } from 'react'
import { createOrder, getUserOrders, getNearbyOrders, updateOrderStatus, deleteOrder, checkAndCancelExpiredOrders, getPendingOrderForDuvet, updateDuvetStatus, type Order, type OrderWithDuvet } from '@/lib/database'
import { getCurrentPosition } from '@/lib/geolocation'

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [nearbyOrders, setNearbyOrders] = useState<OrderWithDuvet[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition({ timeout: 5000 })
      setUserLocation({
        latitude: position.latitude,
        longitude: position.longitude
      })
    } catch (error) {
      console.warn('Could not get user location:', error)
      // Location will remain null, which is fine - we'll show all orders without filtering
    }
  }, [])

  // Load user's orders
  const loadOrders = useCallback(async () => {
    if (!userId) return
    
    setIsLoadingOrders(true)
    try {
      // Check and cancel expired orders first
      await checkAndCancelExpiredOrders()
      
      const [userOrders, nearby] = await Promise.all([
        getUserOrders(userId),
        getNearbyOrders(userId, userLocation || undefined)
      ])
      
      setOrders(userOrders)
      setNearbyOrders(nearby)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoadingOrders(false)
    }
  }, [userId, userLocation])

  // Get user location on mount
  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  // Load orders on mount and when userId/location changes
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Create a new order
  const handleCreateOrder = useCallback(async (
    duvetId: string,
    addressId: string,
    placedPhoto: string | null,
    deadline?: string | null
  ) => {
    if (!userId) return false

    try {
      const order = await createOrder(userId, duvetId, addressId, placedPhoto, deadline)
      if (order) {
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
    status: Order['status'],
    helperId?: string
  ) => {
    try {
      // Find the order to get the duvet ID
      const order = [...orders, ...nearbyOrders].find(o => o.id === orderId)
      
      const success = await updateOrderStatus(orderId, status, helperId)
      if (success && order) {
        // Update duvet status based on order status
        let duvetStatus: string | null = null
        switch (status) {
          case 'accepted':
            duvetStatus = 'help_drying'
            break
          case 'completed':
          case 'cancelled':
            duvetStatus = null
            break
          // 'pending' and 'in_progress' don't change duvet status
        }
        
        if (duvetStatus !== undefined) {
          await updateDuvetStatus(order.quilt_id, duvetStatus as 'help_drying' | null)
        }
        
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }, [loadOrders, orders, nearbyOrders])

  // Delete order
  const handleDeleteOrder = useCallback(async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return false
    }

    try {
      // Find the order to get the duvet ID
      const order = [...orders, ...nearbyOrders].find(o => o.id === orderId)
      
      const success = await deleteOrder(orderId)
      if (success) {
        // Reset duvet status when order is deleted
        if (order) {
          await updateDuvetStatus(order.quilt_id, null)
        }
        
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }, [loadOrders, orders, nearbyOrders])

  // Check if duvet has pending order
  const getPendingOrder = useCallback(async (duvetId: string) => {
    if (!userId) return null
    
    try {
      return await getPendingOrderForDuvet(duvetId, userId)
    } catch (error) {
      console.error('Error checking pending order:', error)
      return null
    }
  }, [userId])

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
    handleAcceptOrder,
    getPendingOrder
  }
}