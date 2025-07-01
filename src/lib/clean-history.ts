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
  afterMiteScore?: number
): Promise<CleanHistoryRecord | null> {
  try {
    const { data, error } = await supabase
      .from('clean_history')
      .insert({
        quilt_id: quiltId,
        user_id: userId,
        start_time: startTime || new Date().toISOString(),
        end_time: endTime || null,
        is_self: true,
        before_mite_score: beforeMiteScore,
        after_mite_score: afterMiteScore || null
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


export async function checkAndCompleteExpiredSunDrying(duvetId: string): Promise<boolean> {
  try {
    // Get latest sun drying record
    const currentRecord = await getCurrentSunDryingStatus(duvetId)
    
    if (!currentRecord || !currentRecord.start_time || !currentRecord.end_time) {
      return false
    }

    const now = new Date()
    const endTime = new Date(currentRecord.end_time)
    
    // If we're past the scheduled end time and have predicted mite score, update the duvet
    if (now >= endTime && currentRecord.after_mite_score !== null) {
      // Get current duvet to check if it already has the updated mite score
      const { data: duvet, error } = await supabase
        .from('quilts')
        .select('mite_score, last_clean')
        .eq('id', duvetId)
        .single()
        
      if (error || !duvet) {
        console.error('Error fetching duvet for mite score check:', error)
        return false
      }
      
      // Only update if the duvet's mite score is different from the predicted score
      // This prevents repeated updates
      if (duvet.mite_score !== currentRecord.after_mite_score) {
        console.log(`Updating duvet ${duvetId} mite score from ${duvet.mite_score} to ${currentRecord.after_mite_score}`)
        
        // Update the duvet's mite score to the predicted value
        await updateDuvetMiteScore(duvetId, currentRecord.after_mite_score)
        
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking and completing expired sun drying:', error)
    return false
  }
}