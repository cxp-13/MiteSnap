import { supabase } from './supabase'

export type DuvetStatus = 'waiting_optimal_time' | 'self_drying' | 'waiting_pickup' | 'help_drying' | 'normal'

export interface Duvet {
  id: string
  name: string
  material: string
  mite_score: number
  image_url: string
  user_id: string
  address_id: string | null
  status: DuvetStatus
  thickness?: string | null
}

export interface Address {
  id: string
  is_default: boolean | null
  user_id: string
  longitude: number | null
  latitude: number | null
  country: string | null
  state: string | null
  city: string | null
  district: string | null
  road: string | null
  house_number: string | null
  neighbourhood: string | null
  created_at: string
  floor_number?: number | null
  has_elevator?: boolean | null
  // Legacy fields for backward compatibility
  apartment?: string | null
  unit?: string | null
  full_address?: string | null
}

export interface Order {
  id: string
  created_at: string
  address_id: string | null
  service_user_id: string | null
  clean_history_id: string | null
  placed_photo: string | null
  user_id: string
  quilt_id: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  dry_photo?: string | null
  cost?: number | null
}

export async function createDuvet(
  userId: string,
  name: string,
  material: string,
  miteScore: number,
  cleaningHistory: string,
  thickness: string,
  imageUrl: string,
  addressId?: string | null
): Promise<Duvet | null> {
  try {
    const { data, error } = await supabase
      .from('quilts')
      .insert({
        name,
        material,
        mite_score: miteScore,
        image_url: imageUrl,
        user_id: userId,
        address_id: addressId || null,
        status: 'normal',
        thickness: thickness
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating duvet:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating duvet:', error)
    return null
  }
}

export async function getUserDuvets(userId: string): Promise<Duvet[]> {
  try {
    const { data, error } = await supabase
      .from('quilts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching duvets:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching duvets:', error)
    return []
  }
}

export async function updateDuvetStatus(duvetId: string, status: DuvetStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quilts')
      .update({ status })
      .eq('id', duvetId)

    if (error) {
      console.error('Error updating duvet status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating duvet status:', error)
    return false
  }
}

export async function createAddress(
  addressData: {
    country?: string | null
    state?: string | null
    city?: string | null
    district?: string | null
    road?: string | null
    house_number?: string | null
    neighbourhood?: string | null
    longitude?: number | null
    latitude?: number | null
    is_default?: boolean
    floor_number?: number | null
    has_elevator?: boolean | null
    // Legacy support
    apartment?: string | null
    unit?: string | null
    full_address?: string | null
  },
  userId: string
): Promise<Address | null> {
  try {
    console.log('💾 database.ts createAddress called with addressData:', addressData)
    console.log('🏗️ database.ts has_elevator received:', addressData.has_elevator, 'type:', typeof addressData.has_elevator)
    
    // DETAILED ELEVATOR DEBUGGING
    console.log('🔍 DETAILED ELEVATOR DEBUG:')
    console.log('  - Raw value:', addressData.has_elevator)
    console.log('  - Type:', typeof addressData.has_elevator)
    console.log('  - === true:', addressData.has_elevator === true)
    console.log('  - === false:', addressData.has_elevator === false)
    console.log('  - === undefined:', addressData.has_elevator === undefined)
    console.log('  - === null:', addressData.has_elevator === null)
    console.log('  - Boolean(value):', Boolean(addressData.has_elevator))
    
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const insertData = {
      user_id: userId,
      is_default: addressData.is_default || false,
      longitude: addressData.longitude || null,
      latitude: addressData.latitude || null,
      country: addressData.country || null,
      state: addressData.state || null,
      city: addressData.city || null,
      district: addressData.district || null,
      road: addressData.road || null,
      house_number: addressData.house_number || null,
      neighbourhood: addressData.neighbourhood || null,
      floor_number: addressData.floor_number || null,
      has_elevator: addressData.has_elevator ?? null
    }
    
    console.log('📊 database.ts insertData being sent to database:', insertData)
    console.log('🏗️ database.ts insertData has_elevator:', insertData.has_elevator, 'type:', typeof insertData.has_elevator)
    
    // DETAILED INSERT DATA DEBUGGING
    console.log('🔍 DETAILED INSERT DATA DEBUG:')
    console.log('  - insertData.has_elevator raw:', insertData.has_elevator)
    console.log('  - insertData.has_elevator type:', typeof insertData.has_elevator)
    console.log('  - insertData.has_elevator === true:', insertData.has_elevator === true)
    console.log('  - insertData.has_elevator === false:', insertData.has_elevator === false)
    console.log('  - insertData.has_elevator === null:', insertData.has_elevator === null)
    console.log('  - JSON.stringify(insertData):', JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase
      .from('addresses')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return null
    }

    console.log('✅ database.ts address created successfully, returned data:', data)
    console.log('🏗️ database.ts returned has_elevator:', data?.has_elevator, 'type:', typeof data?.has_elevator)

    return data
  } catch (error) {
    console.error('Error creating address:', error)
    return null
  }
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return []
  }
}

export async function updateAddress(
  id: string,
  addressData: {
    country?: string | null
    state?: string | null
    city?: string | null
    district?: string | null
    road?: string | null
    house_number?: string | null
    neighbourhood?: string | null
    longitude?: number | null
    latitude?: number | null
    is_default?: boolean
    floor_number?: number | null
    has_elevator?: boolean | null
    // Legacy support
    apartment?: string | null
    unit?: string | null
    full_address?: string | null
  },
  userId: string
): Promise<Address | null> {
  try {
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const updateData: Record<string, unknown> = {}
    
    // New structure fields
    if (addressData.country !== undefined) updateData.country = addressData.country
    if (addressData.state !== undefined) updateData.state = addressData.state
    if (addressData.city !== undefined) updateData.city = addressData.city
    if (addressData.district !== undefined) updateData.district = addressData.district
    if (addressData.road !== undefined) updateData.road = addressData.road
    if (addressData.house_number !== undefined) updateData.house_number = addressData.house_number
    if (addressData.neighbourhood !== undefined) updateData.neighbourhood = addressData.neighbourhood
    if (addressData.longitude !== undefined) updateData.longitude = addressData.longitude
    if (addressData.latitude !== undefined) updateData.latitude = addressData.latitude
    if (addressData.is_default !== undefined) updateData.is_default = addressData.is_default
    if (addressData.floor_number !== undefined) updateData.floor_number = addressData.floor_number
    if (addressData.has_elevator !== undefined) updateData.has_elevator = addressData.has_elevator

    const { data, error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating address:', error)
    return null
  }
}

export async function deleteAddress(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting address:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting address:', error)
    return false
  }
}

export async function setDefaultAddress(id: string, userId: string): Promise<boolean> {
  try {
    // First, set all user's addresses to non-default
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Then set the specific address as default (with user_id constraint for security)
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error setting default address:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error setting default address:', error)
    return false
  }
}

export async function createOrder(
  userId: string,
  duvetId: string,
  addressId: string | null,
  placedPhoto: string | null,
  cleanHistoryId?: string | null,
  optimalStartTime?: string | null,
  optimalEndTime?: string | null,
  aiAnalysis?: { finalMiteScore: number } | null,
  cost?: number | null
): Promise<Order | null> {
  try {
    let finalCleanHistoryId = cleanHistoryId

    // If no clean history ID is provided, create a new help-drying record
    if (!finalCleanHistoryId) {
      // Get the duvet's current mite score
      const { data: duvet, error: duvetError } = await supabase
        .from('quilts')
        .select('mite_score')
        .eq('id', duvetId)
        .single()

      if (duvetError) {
        console.error('Error fetching duvet for clean history:', duvetError)
        // Continue without clean history record
      } else if (duvet) {
        // Create a help-drying clean history record
        const { createSunDryRecord } = await import('./clean-history')
        
        console.log('DEBUG: database.ts - aiAnalysis received:', aiAnalysis)
        console.log('DEBUG: database.ts - aiAnalysis?.finalMiteScore:', aiAnalysis?.finalMiteScore)
        console.log('DEBUG: database.ts - finalMiteScore type:', typeof aiAnalysis?.finalMiteScore)
        
        // Fix: Use nullish coalescing instead of logical OR to handle 0 values correctly
        const afterMiteScore = aiAnalysis?.finalMiteScore ?? undefined
        console.log('DEBUG: database.ts - afterMiteScore for createSunDryRecord:', afterMiteScore)
        
        const cleanRecord = await createSunDryRecord(
          duvetId,
          userId,
          duvet.mite_score || 50,
          optimalStartTime || new Date().toISOString(), // start_time - optimal start or current time
          optimalEndTime || undefined, // end_time - optimal end time or will be set when completed
          afterMiteScore, // after_mite_score - use AI prediction if available
          false // is_self = false for help-drying
        )
        
        if (cleanRecord) {
          finalCleanHistoryId = cleanRecord.id
        }
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        quilt_id: duvetId,
        address_id: addressId,
        placed_photo: placedPhoto,
        clean_history_id: finalCleanHistoryId || null,
        status: 'pending',
        cost: cost || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user orders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}

export async function getUserAcceptedOrders(userId: string): Promise<OrderWithDuvet[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('service_user_id', userId)
      .in('status', ['accepted', 'in_progress', 'completed'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching accepted orders:', error)
      return []
    }

    if (!orders || orders.length === 0) {
      return []
    }

    // Get duvet names for the orders
    const duvetIds = [...new Set(orders.map(order => order.quilt_id).filter(Boolean))]
    const duvetMap = await getDuvetsByIds(duvetIds)

    // Combine orders with duvet names
    const ordersWithDuvets: OrderWithDuvet[] = orders.map(order => ({
      ...order,
      duvet_name: duvetMap[order.quilt_id] || undefined
    }))

    return ordersWithDuvets
  } catch (error) {
    console.error('Error fetching accepted orders:', error)
    return []
  }
}

export interface OrderWithDuvet extends Order {
  duvet_name?: string
}

export async function getAddressById(addressId: string): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching address:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching address:', error)
    return null
  }
}

export async function getAddressesByIds(addressIds: string[]): Promise<Record<string, Address>> {
  try {
    if (addressIds.length === 0) return {}
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .in('id', addressIds)

    if (error) {
      console.error('Error fetching addresses:', error)
      return {}
    }

    // Convert to record for easy lookup
    const addressMap: Record<string, Address> = {}
    data?.forEach(address => {
      addressMap[address.id] = address
    })

    return addressMap
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return {}
  }
}

export async function getDuvetsByIds(duvetIds: string[]): Promise<Record<string, string>> {
  try {
    if (duvetIds.length === 0) return {}
    
    const { data, error } = await supabase
      .from('quilts')
      .select('id, name')
      .in('id', duvetIds)

    if (error) {
      console.error('Error fetching duvets:', error)
      return {}
    }

    // Convert to record for easy lookup
    const duvetMap: Record<string, string> = {}
    data?.forEach(duvet => {
      duvetMap[duvet.id] = duvet.name
    })

    return duvetMap
  } catch (error) {
    console.error('Error fetching duvets:', error)
    return {}
  }
}

export async function getNearbyOrders(
  excludeUserId: string, 
  userLocation?: { latitude: number; longitude: number },
  radiusKm: number = 5
): Promise<OrderWithDuvet[]> {
  try {
    // First get all pending orders excluding current user
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .neq('user_id', excludeUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return []
    }

    if (!orders || orders.length === 0) {
      return []
    }

    // Get unique address IDs from orders
    const addressIds = [...new Set(orders.map(order => order.address_id).filter(Boolean))]
    
    // Fetch addresses for these orders
    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('id, latitude, longitude')
      .in('id', addressIds)

    if (addressError) {
      console.error('Error fetching addresses:', addressError)
      return []
    }

    // Create address lookup map
    const addressMap: Record<string, { latitude: number; longitude: number }> = {}
    addresses?.forEach(addr => {
      if (addr.latitude && addr.longitude) {
        addressMap[addr.id] = { latitude: addr.latitude, longitude: addr.longitude }
      }
    })

    // Filter orders by distance if user location is available
    let filteredOrders = orders
    if (userLocation) {
      const { calculateDistance } = await import('./address-utils')
      filteredOrders = orders.filter(order => {
        if (!order.address_id || !addressMap[order.address_id]) {
          return false // Skip orders without valid addresses
        }
        
        const orderLocation = addressMap[order.address_id]
        const distance = calculateDistance(userLocation, orderLocation)
        return distance <= radiusKm
      })
    }

    // Get duvet names for filtered orders
    const duvetIds = [...new Set(filteredOrders.map(order => order.quilt_id).filter(Boolean))]
    const duvetMap = await getDuvetsByIds(duvetIds)

    // Combine orders with duvet names
    const ordersWithDuvets: OrderWithDuvet[] = filteredOrders.map(order => ({
      ...order,
      duvet_name: duvetMap[order.quilt_id] || undefined
    }))

    return ordersWithDuvets
  } catch (error) {
    console.error('Error fetching nearby orders:', error)
    return []
  }
}

export async function getAllNearbyOrders(
  excludeUserId: string, 
  userLocation?: { latitude: number; longitude: number },
  radiusKm: number = 5
): Promise<OrderWithDuvet[]> {
  try {
    console.log('🔍 getAllNearbyOrders called with:', {
      excludeUserId,
      userLocation,
      radiusKm
    })

    // Get all active orders (not cancelled) excluding current user's own orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .neq('user_id', excludeUserId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Error fetching all nearby orders:', ordersError)
      return []
    }

    console.log(`📊 Initial query returned ${orders?.length || 0} orders`)
    if (!orders || orders.length === 0) {
      console.log('📝 No orders found in initial query')
      return []
    }

    console.log('📋 Orders found:', orders.map(o => ({
      id: o.id,
      status: o.status,
      user_id: o.user_id,
      address_id: o.address_id
    })))

    // Get unique address IDs from orders
    const addressIds = [...new Set(orders.map(order => order.address_id).filter(Boolean))]
    console.log(`📍 Found ${addressIds.length} unique address IDs:`, addressIds)
    
    // Fetch addresses for these orders
    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('id, latitude, longitude')
      .in('id', addressIds)

    if (addressError) {
      console.error('❌ Error fetching addresses for all nearby orders:', addressError)
      return []
    }

    console.log(`🏠 Address query returned ${addresses?.length || 0} addresses`)
    console.log('🏠 Addresses:', addresses?.map(a => ({
      id: a.id,
      lat: a.latitude,
      lng: a.longitude
    })))

    // Create address lookup map
    const addressMap: Record<string, { latitude: number; longitude: number }> = {}
    addresses?.forEach(addr => {
      if (addr.latitude && addr.longitude) {
        addressMap[addr.id] = { latitude: addr.latitude, longitude: addr.longitude }
      }
    })
    console.log(`🗺️ Address map created with ${Object.keys(addressMap).length} valid addresses`)

    // Filter orders by distance if user location is available
    let filteredOrders = orders
    if (userLocation) {
      console.log('📍 User location available, applying distance filter')
      try {
        const { calculateDistance } = await import('./address-utils')
        filteredOrders = orders.filter(order => {
          if (!order.address_id || !addressMap[order.address_id]) {
            console.log(`⚠️ Order ${order.id} kept despite missing address data (address_id: ${order.address_id})`)
            return true // KEEP orders without address data instead of filtering them out
          }
          
          const orderLocation = addressMap[order.address_id]
          const distance = calculateDistance(userLocation, orderLocation)
          console.log(`📐 Order ${order.id} distance: ${distance.toFixed(2)}km (limit: ${radiusKm}km)`)
          return distance <= radiusKm
        })
        console.log(`📊 Distance filtering: ${orders.length} → ${filteredOrders.length} orders`)
      } catch (error) {
        console.error('❌ Error during distance filtering, keeping all orders:', error)
        filteredOrders = orders // Fallback: keep all orders if distance calculation fails
      }
    } else {
      console.log('📍 No user location, skipping distance filter (showing all orders)')
    }

    // Get duvet names for filtered orders
    const duvetIds = [...new Set(filteredOrders.map(order => order.quilt_id).filter(Boolean))]
    console.log(`🧾 Getting duvet names for ${duvetIds.length} duvets`)
    const duvetMap = await getDuvetsByIds(duvetIds)

    // Combine orders with duvet names
    const ordersWithDuvets: OrderWithDuvet[] = filteredOrders.map(order => ({
      ...order,
      duvet_name: duvetMap[order.quilt_id] || undefined
    }))

    console.log(`✅ getAllNearbyOrders returning ${ordersWithDuvets.length} orders for user ${excludeUserId}`)
    console.log('📋 Final orders:', ordersWithDuvets.map(o => ({
      id: o.id,
      status: o.status,
      duvet_name: o.duvet_name
    })))
    return ordersWithDuvets
  } catch (error) {
    console.error('Error fetching all nearby orders:', error)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  serviceUserId?: string | null,
  dryPhoto?: string | null
): Promise<boolean> {
  try {
    const updateData: Record<string, unknown> = { status }
    if (serviceUserId !== undefined) {
      updateData.service_user_id = serviceUserId
    }
    if (dryPhoto !== undefined) {
      updateData.dry_photo = dryPhoto
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) {
      console.error('Error deleting order:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}

export async function getPendingOrderForDuvet(duvetId: string, userId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('quilt_id', duvetId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching pending order for duvet:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Error fetching pending order for duvet:', error)
    return null
  }
}

/**
 * Checks and cancels expired orders based on clean history start time.
 * An order is considered expired if it has a clean_history_id with a start_time in the past but is still pending.
 * @returns {Promise<boolean>} True if the operation succeeded, false otherwise.
 */
export async function checkAndCancelExpiredOrders(): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    
    // Get orders that have clean history but are still pending
    const { data: ordersToCheck, error: fetchError } = await supabase
      .from('orders')
      .select('id, clean_history_id')
      .eq('status', 'pending')
      .not('clean_history_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching orders for expiry check:', fetchError)
      return false
    }

    if (!ordersToCheck || ordersToCheck.length === 0) {
      return true // No orders to check
    }

    // Get clean history records for these orders
    const cleanHistoryIds = ordersToCheck.map(o => o.clean_history_id).filter(Boolean)
    const { data: cleanHistories, error: cleanError } = await supabase
      .from('clean_history')
      .select('id, start_time')
      .in('id', cleanHistoryIds)
      .lt('start_time', now)

    if (cleanError) {
      console.error('Error fetching clean histories for expiry check:', cleanError)
      return false
    }

    if (!cleanHistories || cleanHistories.length === 0) {
      return true // No expired clean histories
    }

    // Get orders that need to be cancelled
    const expiredCleanHistoryIds = cleanHistories.map(ch => ch.id)
    const ordersToCancel = ordersToCheck.filter(o => 
      o.clean_history_id && expiredCleanHistoryIds.includes(o.clean_history_id)
    )

    if (ordersToCancel.length === 0) {
      return true
    }

    // Cancel the expired orders
    const orderIdsToCancel = ordersToCancel.map(o => o.id)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .in('id', orderIdsToCancel)

    if (updateError) {
      console.error('Error cancelling expired orders:', updateError)
      return false
    }

    console.log(`Cancelled ${orderIdsToCancel.length} expired orders based on clean history start time`)
    return true
  } catch (error) {
    console.error('Error checking expired orders:', error)
    return false
  }
}