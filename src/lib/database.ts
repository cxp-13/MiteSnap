import { supabase } from './supabase'

export interface Duvet {
  id: string
  name: string
  material: string
  mite_score: number
  image_url: string
  user_id: string
  address_id: string | null
  last_clean: string | null
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
        last_clean: null
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
  cleanHistoryId?: string | null
): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        quilt_id: duvetId,
        address_id: addressId,
        placed_photo: placedPhoto,
        clean_history_id: cleanHistoryId || null,
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

export async function getNearbyOrders(excludeUserId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('user_id', excludeUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching nearby orders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching nearby orders:', error)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  serviceUserId?: string | null
): Promise<boolean> {
  try {
    const updateData: any = { status }
    if (serviceUserId !== undefined) {
      updateData.service_user_id = serviceUserId
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