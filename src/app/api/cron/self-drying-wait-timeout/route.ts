import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateDuvetStatus } from '@/lib/database'
import { getClerkUserById } from '@/lib/clerk-server'
import { sendSelfDryingReminderEmail } from '@/lib/email'

interface TimeoutResult {
  processedCount: number
  updatedCount: number
  emailsSent: number
  errors: string[]
}

export async function GET() {
  try {
    const result: TimeoutResult = {
      processedCount: 0,
      updatedCount: 0,
      emailsSent: 0,
      errors: []
    }

    // Get all duvets in waiting_optimal_time status with user_id and name for email notification
    const { data: duvets, error } = await supabase
      .from('quilts')
      .select('id, status, user_id, name')
      .eq('status', 'waiting_optimal_time')

    if (error) {
      console.error('Error fetching waiting duvets:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch waiting duvets',
          ...result
        },
        { status: 500 }
      )
    }

    if (!duvets || duvets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duvets in waiting status',
        ...result
      })
    }

    // Get clean history records to check start and end times
    const duvetIds = duvets.map(d => d.id)
    const { data: cleanRecords, error: cleanError } = await supabase
      .from('clean_history')
      .select('quilt_id, start_time, end_time')
      .in('quilt_id', duvetIds)
      .eq('is_self', true)
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

    // Create maps of duvet_id to latest start_time and end_time
    const timeWindowMap: Record<string, { start_time: string; end_time: string | null }> = {}
    cleanRecords?.forEach(record => {
      if (!timeWindowMap[record.quilt_id] && record.start_time) {
        timeWindowMap[record.quilt_id] = {
          start_time: record.start_time,
          end_time: record.end_time
        }
      }
    })

    const now = new Date()

    // Check each duvet to see if it's time to start drying
    for (const duvet of duvets) {
      try {
        result.processedCount++
        
        const timeWindow = timeWindowMap[duvet.id]
        if (!timeWindow || !timeWindow.start_time) {
          continue
        }

        const startDate = new Date(timeWindow.start_time)
        
        // If current time is at or past the start time, update to self_drying
        if (now >= startDate) {
          console.log(`Starting self-drying for duvet ${duvet.id} - start time reached`)
          
          // Update duvet status to self_drying
          const updated = await updateDuvetStatus(duvet.id, 'self_drying')
          
          if (updated) {
            result.updatedCount++
            
            // Send reminder email to user
            try {
              console.log(`Sending reminder email for duvet ${duvet.id}`)
              
              // Get user information from Clerk
              const clerkUser = await getClerkUserById(duvet.user_id)
              
              if (clerkUser?.email && timeWindow.end_time) {
                // Send drying reminder email
                const emailSent = await sendSelfDryingReminderEmail({
                  userEmail: clerkUser.email,
                  userName: clerkUser.name,
                  duvetName: duvet.name,
                  startTime: timeWindow.start_time,
                  endTime: timeWindow.end_time
                })
                
                if (emailSent) {
                  result.emailsSent++
                  console.log(`Successfully sent reminder email for duvet ${duvet.id} to ${clerkUser.email}`)
                } else {
                  console.error(`Failed to send reminder email for duvet ${duvet.id}`)
                  result.errors.push(`Failed to send email for duvet ${duvet.id}`)
                }
              } else {
                console.error(`No email found for user ${duvet.user_id} or missing end time (duvet ${duvet.id})`)
                result.errors.push(`No email found for user ${duvet.user_id} or missing end time`)
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
      message: `Processed ${result.processedCount} duvets, started drying for ${result.updatedCount}, sent ${result.emailsSent} reminder emails`,
      ...result
    })

  } catch (error) {
    console.error('Error in self-drying wait timeout check:', error)
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