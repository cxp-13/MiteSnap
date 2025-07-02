import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkAndCompleteExpiredSunDrying } from '@/lib/clean-history'
import { Duvet } from '@/lib/database'

interface UpdateResult {
  processedCount: number
  updatedCount: number
  errors: string[]
}

async function getDryingDuvets(): Promise<Duvet[]> {
  try {
    const { data, error } = await supabase
      .from('quilts')
      .select('*')
      .in('status', ['self_drying', 'waiting_optimal_time'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching drying duvets:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching drying duvets:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple API key authentication
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key')
    const expectedApiKey = process.env.CRON_API_KEY
    
    if (!expectedApiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    // Fetch all duvets that are currently drying or waiting for optimal time
    const dryingDuvets = await getDryingDuvets()
    
    const result: UpdateResult = {
      processedCount: 0,
      updatedCount: 0,
      errors: []
    }

    // Process each duvet
    for (const duvet of dryingDuvets) {
      try {
        result.processedCount++
        const wasUpdated = await checkAndCompleteExpiredSunDrying(duvet.id)
        if (wasUpdated) {
          result.updatedCount++
        }
      } catch (error) {
        const errorMessage = `Error processing duvet ${duvet.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMessage)
        result.errors.push(errorMessage)
      }
    }

    // Return success response with summary
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} duvets, updated ${result.updatedCount}`,
      ...result
    })

  } catch (error) {
    console.error('Error in update-expired-drying endpoint:', error)
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