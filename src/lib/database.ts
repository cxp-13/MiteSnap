import { supabase } from './supabase'

export interface Duvet {
  id: string
  name: string
  material: string
  mite_score: number
  image_url: string
  user_id: string
  last_clean: string | null
}

export interface Address {
  id: string
  apartment: string | null
  unit: string | null
  full_address: string | null
  is_default: boolean | null
  user_id: string
  longitude: number | null
  latitude: number | null
  created_at: string
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
  name: string,
  material: string,
  miteScore: number,
  imageUrl: string,
  userId: string,
  lastClean?: string | null
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
        last_clean: lastClean || null
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
  apartment: string | null,
  unit: string | null,
  fullAddress: string | null,
  isDefault: boolean,
  userId: string,
  longitude?: number | null,
  latitude?: number | null
): Promise<Address | null> {
  try {
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        apartment,
        unit,
        full_address: fullAddress,
        is_default: isDefault,
        user_id: userId,
        longitude: longitude || null,
        latitude: latitude || null
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
  apartment: string | null,
  unit: string | null,
  fullAddress: string | null,
  isDefault: boolean,
  userId: string,
  longitude?: number | null,
  latitude?: number | null
): Promise<Address | null> {
  try {
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        apartment,
        unit,
        full_address: fullAddress,
        is_default: isDefault,
        longitude: longitude || null,
        latitude: latitude || null
      })
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
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)

    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)

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