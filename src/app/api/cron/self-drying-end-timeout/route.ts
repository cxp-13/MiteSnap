import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateDuvetStatus } from '@/lib/database'
import { updateDuvetMiteScore } from '@/lib/clean-history'
import { getClerkUserById } from '@/lib/clerk-server'
import { sendDryingCompletionEmail } from '@/lib/email'

interface TimeoutResult {
  processedCount: number
  updatedCount: number
  miteScoresUpdated: number
  emailsSent: number
  errors: string[]
}

export async function GET() {
  try {
    const result: TimeoutResult = {
      processedCount: 0,
      updatedCount: 0,
      miteScoresUpdated: 0,
      emailsSent: 0,
      errors: []
    }

    // Get all duvets in self_drying status with user_id and name for email notification
    const { data: duvets, error } = await supabase
      .from('quilts')
      .select('id, status, user_id, name')
      .eq('status', 'self_drying')

    if (error) {
      console.error('Error fetching drying duvets:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch drying duvets',
          ...result
        },
        { status: 500 }
      )
    }

    if (!duvets || duvets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duvets in self_drying status',
        ...result
      })
    }

    // Get clean history records to check end times and after_mite_score
    const duvetIds = duvets.map(d => d.id)
    const { data: cleanRecords, error: cleanError } = await supabase
      .from('clean_history')
      .select('quilt_id, end_time, after_mite_score')
      .in('quilt_id', duvetIds)
      .eq('is_self', true)
      .not('end_time', 'is', null)
      .order('created_at', { ascending: false })

    if (cleanError) {
      console.error('Error fetching clean records:', cleanError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch clean records',
          ...result
        },
        { status: 500 }
      )
    }

    // Create maps of duvet_id to latest end_time and after_mite_score
    const endTimeMap: Record<string, string> = {}
    const miteScoreMap: Record<string, number> = {}
    cleanRecords?.forEach(record => {
      if (!endTimeMap[record.quilt_id] && record.end_time) {
        endTimeMap[record.quilt_id] = record.end_time
        if (record.after_mite_score !== null) {
          miteScoreMap[record.quilt_id] = record.after_mite_score
        }
      }
    })

    const now = new Date()

    // Check each duvet for end time timeout
    for (const duvet of duvets) {
      try {
        result.processedCount++
        
        const endTime = endTimeMap[duvet.id]
        if (!endTime) {
          continue
        }

        const endDate = new Date(endTime)
        
        // If past end time, reset to normal and update mite score
        if (now > endDate) {
          console.log(`Resetting duvet ${duvet.id} - past end time ${endTime}`)
          
          // Reset duvet status to normal
          const updated = await updateDuvetStatus(duvet.id, 'normal')
          
          // Update mite score based on prediction from clean history
          const afterMiteScore = miteScoreMap[duvet.id]
          if (afterMiteScore !== undefined) {
            const miteScoreUpdated = await updateDuvetMiteScore(duvet.id, afterMiteScore)
            if (miteScoreUpdated) {
              result.miteScoresUpdated++
              console.log(`Updated mite score for duvet ${duvet.id} to ${afterMiteScore}`)
            }
          }
          
          if (updated) {
            result.updatedCount++
            
            // Send email notification to user
            try {
              console.log(`Sending completion email for duvet ${duvet.id}`)
              
              // Get user information from Clerk
              const clerkUser = await getClerkUserById(duvet.user_id)
              
              if (clerkUser?.email) {
                // Send drying completion email
                const emailSent = await sendDryingCompletionEmail({
                  userEmail: clerkUser.email,
                  userName: clerkUser.name,
                  duvetName: duvet.name,
                  completedAt: new Date().toISOString()
                })
                
                if (emailSent) {
                  result.emailsSent++
                  console.log(`Successfully sent completion email for duvet ${duvet.id} to ${clerkUser.email}`)
                } else {
                  console.error(`Failed to send completion email for duvet ${duvet.id}`)
                  result.errors.push(`Failed to send email for duvet ${duvet.id}`)
                }
              } else {
                console.error(`No email found for user ${duvet.user_id} (duvet ${duvet.id})`)
                result.errors.push(`No email found for user ${duvet.user_id}`)
              }
            } catch (emailError) {
              const emailErrorMessage = `Error sending email for duvet ${duvet.id}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
              console.error(emailErrorMessage)
              result.errors.push(emailErrorMessage)
              // Don't fail the whole operation if email fails
            }
          }
        }
      } catch (error) {
        const errorMessage = `Error processing duvet ${duvet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMessage)
        result.errors.push(errorMessage)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} duvets, reset ${result.updatedCount} to normal, updated ${result.miteScoresUpdated} mite scores, sent ${result.emailsSent} completion emails`,
      ...result
    })

  } catch (error) {
    console.error('Error in self-drying end timeout check:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}