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