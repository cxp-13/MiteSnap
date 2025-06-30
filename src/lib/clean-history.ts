import { supabase } from './supabase'

export interface CleanHistoryRecord {
  id: string
  created_at: string
  quilt_id: string
  user_id: string
  start_time: string | null
  end_time: string | null
  is_self: boolean | null
  before_mite_score: number | null
  after_mite_score: number | null
}

export async function createSunDryRecord(
  quiltId: string,
  userId: string,
  beforeMiteScore: number
): Promise<CleanHistoryRecord | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .insert({
        quilt_id: quiltId,
        user_id: userId,
        start_time: new Date().toISOString(),
        is_self: true,
        before_mite_score: beforeMiteScore
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sun dry record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating sun dry record:', error)
    return null
  }
}

export async function updateSunDryRecord(
  recordId: string,
  afterMiteScore: number
): Promise<CleanHistoryRecord | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .update({
        end_time: new Date().toISOString(),
        after_mite_score: afterMiteScore
      })
      .eq('id', recordId)
      .select()
      .single()

    if (error) {
      console.error('Error updating sun dry record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating sun dry record:', error)
    return null
  }
}

export async function getUserSunDryHistory(userId: string): Promise<CleanHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_self', true)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching sun dry history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching sun dry history:', error)
    return []
  }
}

export async function getDuvetSunDryHistory(duvetId: string): Promise<CleanHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('quilt_id', duvetId)
      .eq('is_self', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching duvet sun dry history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching duvet sun dry history:', error)
    return []
  }
}

export async function updateDuvetLastClean(duvetId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quilts')
      .update({
        last_clean: new Date().toISOString()
      })
      .eq('id', duvetId)

    if (error) {
      console.error('Error updating duvet last clean:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating duvet last clean:', error)
    return false
  }
}

export async function updateDuvetMiteScore(duvetId: string, newMiteScore: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quilts')
      .update({
        mite_score: newMiteScore,
        last_clean: new Date().toISOString()
      })
      .eq('id', duvetId)

    if (error) {
      console.error('Error updating duvet mite score:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating duvet mite score:', error)
    return false
  }
}

export async function getCurrentSunDryingStatus(duvetId: string): Promise<CleanHistoryRecord | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('quilt_id', duvetId)
      .eq('is_self', true)
      .is('end_time', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No records found - duvet is not currently sun-drying (this is normal, not an error)
        return null
      }
      console.error('Error fetching current sun drying status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching current sun drying status:', error)
    return null
  }
}