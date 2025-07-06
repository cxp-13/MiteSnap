import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateDuvetStatus } from '@/lib/database'
import { deleteCleanHistoryByDuvetId } from '@/lib/clean-history'

interface TimeoutResult {
  processedCount: number
  updatedCount: number
  cleanRecordsDeleted: number
  errors: string[]
}

export async function GET() {
  try {
    const result: TimeoutResult = {
      processedCount: 0,
      updatedCount: 0,
      cleanRecordsDeleted: 0,
      errors: []
    }

    // Get all duvets in waiting_optimal_time status
    const { data: duvets, error } = await supabase
      .from('quilts')
      .select('id, status')
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

    // Get clean history records to check start times
    const duvetIds = duvets.map(d => d.id)
    const { data: cleanRecords, error: cleanError } = await supabase
      .from('clean_history')
      .select('quilt_id, start_time')
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

    // Create a map of duvet_id to latest start_time
    const startTimeMap: Record<string, string> = {}
    cleanRecords?.forEach(record => {
      if (!startTimeMap[record.quilt_id]) {
        startTimeMap[record.quilt_id] = record.start_time
      }
    })

    const now = new Date()
    const fifteenMinutesInMs = 15 * 60 * 1000

    // Check each duvet for timeout
    for (const duvet of duvets) {
      try {
        result.processedCount++
        
        const startTime = startTimeMap[duvet.id]
        if (!startTime) {
          continue
        }

        const startDate = new Date(startTime)
        const timeSinceStart = now.getTime() - startDate.getTime()

        // If more than 15 minutes past start time, reset to normal
        if (timeSinceStart > fifteenMinutesInMs) {
          console.log(`Resetting duvet ${duvet.id} - waited ${Math.floor(timeSinceStart / 60000)} minutes`)
          
          // Reset duvet status to normal
          const updated = await updateDuvetStatus(duvet.id, 'normal')
          
          // Delete related clean history records (unfinished ones)
          const cleanRecordsDeleted = await deleteCleanHistoryByDuvetId(duvet.id)
          if (cleanRecordsDeleted) {
            result.cleanRecordsDeleted++
          }
          
          if (updated) {
            result.updatedCount++
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
      message: `Processed ${result.processedCount} duvets, reset ${result.updatedCount} to normal, deleted ${result.cleanRecordsDeleted} clean records`,
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