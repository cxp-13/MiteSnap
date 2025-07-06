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
  beforeMiteScore: number,
  startTime?: string,
  endTime?: string,
  afterMiteScore?: number,
  isSelf: boolean = true
): Promise<CleanHistoryRecord | null> {
  try {
    console.log('DEBUG: createSunDryRecord - received parameters:')
    console.log('- quiltId:', quiltId)
    console.log('- userId:', userId)
    console.log('- beforeMiteScore:', beforeMiteScore)
    console.log('- startTime:', startTime)
    console.log('- endTime:', endTime)
    console.log('- afterMiteScore:', afterMiteScore)
    console.log('- afterMiteScore type:', typeof afterMiteScore)
    console.log('- isSelf:', isSelf)
    
    // Fix: Use nullish coalescing to handle 0 values correctly
    const finalAfterMiteScore = afterMiteScore ?? null
    console.log('DEBUG: createSunDryRecord - finalAfterMiteScore:', finalAfterMiteScore)
    
    const insertData = {
      quilt_id: quiltId,
      user_id: userId,
      start_time: startTime || new Date().toISOString(),
      end_time: endTime || null,
      is_self: isSelf,
      before_mite_score: beforeMiteScore,
      after_mite_score: finalAfterMiteScore
    }
    
    console.log('DEBUG: createSunDryRecord - insertData:', insertData)

    const { data, error } = await supabase
      .from('clean_history')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating sun dry record:', error)
      return null
    }

    console.log('DEBUG: createSunDryRecord - created record:', data)
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

export async function completeSunDryRecord(
  recordId: string
): Promise<CleanHistoryRecord | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .update({
        end_time: new Date().toISOString()
      })
      .eq('id', recordId)
      .select()
      .single()

    if (error) {
      console.error('Error completing sun dry record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error completing sun dry record:', error)
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


export async function updateDuvetMiteScore(duvetId: string, newMiteScore: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('quilts')
      .update({
        mite_score: newMiteScore
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

/**
 * Get the last cleaning date for a duvet from clean history
 */
export async function getDuvetLastCleanDate(duvetId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .select('end_time')
      .eq('quilt_id', duvetId)
      .not('end_time', 'is', null)
      .order('end_time', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No completed cleaning records found
        return null
      }
      console.error('Error fetching last clean date:', error)
      return null
    }

    return data?.end_time || null
  } catch (error) {
    console.error('Error fetching last clean date:', error)
    return null
  }
}

export async function getCleanHistoryRecord(
  recordId: string
): Promise<CleanHistoryRecord | null> {
  try {
    console.log(`🔍 [getCleanHistoryRecord] Fetching record for ID: ${recordId}`)
    
    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('id', recordId)
      .single()

    console.log(`🔍 [getCleanHistoryRecord] Database response:`)
    console.log('  Data:', data)
    console.log('  Error:', error)

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[getCleanHistoryRecord] No record found for ID: ${recordId}`)
        return null
      }
      console.error(`[getCleanHistoryRecord] Error:`, error)
      return null
    }

    console.log(`[getCleanHistoryRecord] Successfully retrieved record for ID: ${recordId}`, data)
    return data
  } catch (err) {
    console.error(`[getCleanHistoryRecord] Exception:`, err)
    return null
  }
}

export async function getCurrentSunDryingStatus(
  duvetId: string
): Promise<CleanHistoryRecord | null> {
  console.log(`[getCurrentSunDryingStatus] Start - duvetId:`, duvetId)

  try {
    console.log(`[getCurrentSunDryingStatus] Querying Supabase...`)

    const { data, error } = await supabase
      .from('clean_history')
      .select('*')
      .eq('quilt_id', duvetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    console.log(`[getCurrentSunDryingStatus] Query result:`, { data, error })

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(
          `[getCurrentSunDryingStatus] No sun-drying records for duvetId: ${duvetId}`
        )
        return null
      }

      console.error(
        `[getCurrentSunDryingStatus] Unexpected error from Supabase:`,
        error
      )
      return null
    }

    console.log(
      `[getCurrentSunDryingStatus] Latest sun-drying record found:`,
      data
    )
    return data
  } catch (err) {
    console.error(
      `[getCurrentSunDryingStatus] Exception occurred while querying:`,
      err
    )
    return null
  }
}

export async function deleteCleanHistoryRecord(recordId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clean_history')
      .delete()
      .eq('id', recordId)

    if (error) {
      console.error('Error deleting clean history record:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting clean history record:', error)
    return false
  }
}

export async function deleteCleanHistoryByDuvetId(duvetId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clean_history')
      .delete()
      .eq('quilt_id', duvetId)
      .is('end_time', null)

    if (error) {
      console.error('Error deleting clean history records by duvet ID:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting clean history records by duvet ID:', error)
    return false
  }
}


