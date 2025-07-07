import { useState, useEffect, useCallback } from 'react'
import { createOrder, getUserOrders, getUserAcceptedOrders, getNearbyOrders, getAllNearbyOrders, updateOrderStatus, deleteOrder, checkAndCancelExpiredOrders, getPendingOrderForDuvet, updateDuvetStatus, type Order, type OrderWithDuvet, getAddressById } from '@/lib/database'
import { getCurrentPosition } from '@/lib/geolocation'
import { calculateTotalCostByThickness } from '@/lib/pricing'
import { supabase } from '@/lib/supabase'

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [acceptedOrders, setAcceptedOrders] = useState<OrderWithDuvet[]>([])
  const [nearbyOrders, setNearbyOrders] = useState<OrderWithDuvet[]>([])
  const [allNearbyOrders, setAllNearbyOrders] = useState<OrderWithDuvet[]>([])
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
      
      const [userOrders, acceptedOrdersData, nearby, allNearby] = await Promise.all([
        getUserOrders(userId),
        getUserAcceptedOrders(userId),
        getNearbyOrders(userId, userLocation || undefined),
        getAllNearbyOrders(userId, userLocation || undefined)
      ])
      
      setOrders(userOrders)
      setAcceptedOrders(acceptedOrdersData)
      setNearbyOrders(nearby)
      setAllNearbyOrders(allNearby)
      
      console.log('📊 Orders loaded:', {
        userOrders: userOrders.length,
        acceptedOrders: acceptedOrdersData.length,
        nearbyOrders: nearby.length,
        allNearbyOrders: allNearby.length
      })
      console.log('📋 All nearby orders details:', allNearby.map(o => ({
        id: o.id,
        status: o.status,
        user_id: o.user_id,
        service_user_id: o.service_user_id,
        duvet_name: o.duvet_name
      })))
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
    optimalStartTime?: string | null,
    optimalEndTime?: string | null,
    aiAnalysis?: { finalMiteScore: number } | null
  ) => {
    if (!userId) return false

    try {
      // Calculate cost based on duvet and address information
      let calculatedCost: number | null = null
      
      try {
        // Get duvet information
        const { data: duvet } = await supabase
          .from('quilts')
          .select('thickness')
          .eq('id', duvetId)
          .single()

        // Get address information  
        const address = await getAddressById(addressId)

        if (duvet && address && duvet.thickness && address.floor_number !== null && address.has_elevator !== null) {
          calculatedCost = calculateTotalCostByThickness(
            duvet.thickness, 
            address.floor_number || 1, 
            address.has_elevator || false
          )
          console.log('Calculated cost:', calculatedCost, 'for thickness:', duvet.thickness, 'floor:', address.floor_number, 'elevator:', address.has_elevator)
        } else {
          console.warn('Missing data for cost calculation:', { 
            duvet: duvet?.thickness, 
            floor: address?.floor_number, 
            elevator: address?.has_elevator 
          })
        }
      } catch (costError) {
        console.error('Error calculating cost:', costError)
      }

      const order = await createOrder(userId, duvetId, addressId, placedPhoto, undefined, optimalStartTime, optimalEndTime, aiAnalysis, calculatedCost)
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
    helperId?: string,
    dryPhoto?: string | null
  ) => {
    try {
      // Find the order to get the duvet ID
      const order = [...orders, ...acceptedOrders, ...nearbyOrders].find(o => o.id === orderId)
      
      const success = await updateOrderStatus(orderId, status, helperId, dryPhoto)
      if (success && order) {
        // Update duvet status based on order status
        let duvetStatus: string | null = null
        switch (status) {
          case 'accepted':
          case 'in_progress':
            duvetStatus = 'help_drying'
            break
          case 'completed':
            duvetStatus = 'self_drying' // Set to drying status when service is completed
            break
          case 'cancelled':
            duvetStatus = 'normal'
            break
          // 'pending' doesn't change duvet status
        }
        
        if (duvetStatus !== undefined) {
          await updateDuvetStatus(order.quilt_id, duvetStatus as 'help_drying' | 'self_drying' | 'normal')
        }
        
        // Handle clean history update for completed help-drying orders
        if (status === 'completed' && order.clean_history_id) {
          try {
            // Complete the sun dry record (only set end_time, preserve AI-predicted after_mite_score)
            const { completeSunDryRecord } = await import('@/lib/clean-history')
            const completedRecord = await completeSunDryRecord(order.clean_history_id)
            
            if (completedRecord && completedRecord.after_mite_score !== null) {
              // Update the duvet's mite score using the AI-predicted value
              const { updateDuvetMiteScore } = await import('@/lib/clean-history')
              await updateDuvetMiteScore(order.quilt_id, completedRecord.after_mite_score)
            }
          } catch (error) {
            console.error('Error updating clean history for completed help-drying order:', error)
          }
        }
        
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }, [loadOrders, orders, acceptedOrders, nearbyOrders])

  // Delete order
  const handleDeleteOrder = useCallback(async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return false
    }

    try {
      // Find the order to get the duvet ID
      const order = [...orders, ...acceptedOrders, ...nearbyOrders].find(o => o.id === orderId)
      
      const success = await deleteOrder(orderId)
      if (success) {
        // Reset duvet status when order is deleted
        if (order) {
          await updateDuvetStatus(order.quilt_id, 'normal')
        }
        
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }, [loadOrders, orders, acceptedOrders, nearbyOrders])

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

    try {
      // Find the order to get the duvet ID
      const order = allNearbyOrders.find(o => o.id === orderId)
      
      const success = await updateOrderStatus(orderId, 'accepted', userId)
      if (success && order) {
        // Update duvet status to help_drying when order is accepted
        await updateDuvetStatus(order.quilt_id, 'help_drying')
        
        await loadOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error accepting order:', error)
      return false
    }
  }, [userId, loadOrders, allNearbyOrders])

  // Cancel an accepted order
  const handleCancelAcceptedOrder = useCallback(async (orderId: string) => {
    if (!userId) return false

    try {
      // Find the order to get the duvet ID
      const order = allNearbyOrders.find(o => o.id === orderId)
      console.log('🔄 Canceling order:', orderId, 'Current service_user_id:', order?.service_user_id)
      
      const success = await updateOrderStatus(orderId, 'pending', null) // Remove helper and reset service_user_id
      if (success && order) {
        console.log('✅ Order status updated to pending with service_user_id reset to null')
        
        // Update duvet status to waiting_pickup when order is cancelled
        await updateDuvetStatus(order.quilt_id, 'waiting_pickup')
        console.log('✅ Duvet status updated to waiting_pickup')
        
        await loadOrders()
        console.log('✅ Orders reloaded after cancellation')
        return true
      }
      return false
    } catch (error) {
      console.error('Error canceling order:', error)
      return false
    }
  }, [userId, loadOrders, allNearbyOrders])

  return {
    // State
    orders,
    acceptedOrders,
    nearbyOrders,
    allNearbyOrders,
    isLoadingOrders,
    
    // Actions
    loadOrders,
    handleCreateOrder,
    handleUpdateOrderStatus,
    handleDeleteOrder,
    handleAcceptOrder,
    handleCancelAcceptedOrder,
    getPendingOrder
  }
}