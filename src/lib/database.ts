import { supabase } from './supabase'

export type DuvetStatus = 'waiting_optimal_time' | 'self_drying' | 'waiting_pickup' | 'help_drying' | null

export interface Duvet {
  id: string
  name: string
  material: string
  mite_score: number
  image_url: string
  user_id: string
  address_id: string | null
  last_clean: string | null
  status: DuvetStatus
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
  address_line: string | null
  created_at: string
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
  deadline: string | null
  dry_photo?: string | null
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
        last_clean: null,
        status: null
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
    address_line?: string | null
    longitude?: number | null
    latitude?: number | null
    is_default?: boolean
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

    const { data, error } = await supabase
      .from('addresses')
      .insert({
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
        address_line: addressData.address_line || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return null
    }

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
    address_line?: string | null
    longitude?: number | null
    latitude?: number | null
    is_default?: boolean
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

    const updateData: any = {}
    
    // New structure fields
    if (addressData.country !== undefined) updateData.country = addressData.country
    if (addressData.state !== undefined) updateData.state = addressData.state
    if (addressData.city !== undefined) updateData.city = addressData.city
    if (addressData.district !== undefined) updateData.district = addressData.district
    if (addressData.road !== undefined) updateData.road = addressData.road
    if (addressData.house_number !== undefined) updateData.house_number = addressData.house_number
    if (addressData.neighbourhood !== undefined) updateData.neighbourhood = addressData.neighbourhood
    if (addressData.address_line !== undefined) updateData.address_line = addressData.address_line
    if (addressData.longitude !== undefined) updateData.longitude = addressData.longitude
    if (addressData.latitude !== undefined) updateData.latitude = addressData.latitude
    if (addressData.is_default !== undefined) updateData.is_default = addressData.is_default

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
  deadline?: string | null,
  cleanHistoryId?: string | null,
  optimalStartTime?: string | null,
  optimalEndTime?: string | null,
  aiAnalysis?: { finalMiteScore: number } | null
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
        const cleanRecord = await createSunDryRecord(
          duvetId,
          userId,
          duvet.mite_score || 50,
          optimalStartTime || new Date().toISOString(), // start_time - optimal start or current time
          optimalEndTime || undefined, // end_time - optimal end time or will be set when completed
          aiAnalysis?.finalMiteScore || undefined, // after_mite_score - use AI prediction if available
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
        deadline: deadline || null,
        clean_history_id: finalCleanHistoryId || null,
        status: 'pending'
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

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  serviceUserId?: string | null,
  dryPhoto?: string | null
): Promise<boolean> {
  try {
    const updateData: any = { status }
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
 * Checks and cancels expired orders by updating their status to 'cancelled'.
 * An order is considered expired if its deadline is in the past and its status is 'pending'.
 * @returns {Promise<boolean>} True if the operation succeeded, false otherwise.
 */
export async function checkAndCancelExpiredOrders(): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lt('deadline', now)
      .not('deadline', 'is', null)

    if (error) {
      console.error('Error cancelling expired orders:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking expired orders:', error)
    return false
  }
}