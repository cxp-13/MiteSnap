import { NextResponse } from 'next/server'
import { calculateMiteCoefficientGrowth } from '@/lib/mite-growth'

interface MiteGrowthResult {
  processedCount: number
  updatedCount: number
  skippedCount: number
  errors: string[]
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('🚀 Starting mite growth update cron job...')
    
    // Execute the mite coefficient growth calculation
    const result: MiteGrowthResult = await calculateMiteCoefficientGrowth()
    
    const executionTime = Date.now() - startTime
    console.log(`⏱️ Mite growth update completed in ${executionTime}ms`)

    // Determine success based on results
    const hasErrors = result.errors.length > 0
    const hasUpdates = result.updatedCount > 0
    
    let message = ''
    if (hasUpdates && !hasErrors) {
      message = `✅ Successfully processed ${result.processedCount} duvets, updated ${result.updatedCount} mite scores`
    } else if (hasUpdates && hasErrors) {
      message = `⚠️ Partially successful: updated ${result.updatedCount} duvets, but encountered ${result.errors.length} errors`
    } else if (!hasUpdates && !hasErrors && result.processedCount === 0) {
      message = '📭 No duvets found to process'
    } else if (!hasUpdates && !hasErrors && result.skippedCount > 0) {
      message = `⚠️ Processed ${result.processedCount} duvets but skipped ${result.skippedCount} due to missing location data`
    } else {
      message = `❌ Failed to update any duvets. Processed: ${result.processedCount}, Errors: ${result.errors.length}`
    }

    // Log final summary
    console.log(`📊 MITE GROWTH CRON SUMMARY:`)
    console.log(`   - Processed: ${result.processedCount}`)
    console.log(`   - Updated: ${result.updatedCount}`)
    console.log(`   - Skipped: ${result.skippedCount}`)
    console.log(`   - Errors: ${result.errors.length}`)
    console.log(`   - Execution time: ${executionTime}ms`)
    
    if (result.errors.length > 0) {
      console.log(`❌ Errors encountered:`)
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    // Return appropriate HTTP status
    const statusCode = hasErrors ? (hasUpdates ? 207 : 500) : 200 // 207 = Multi-Status for partial success

    return NextResponse.json({
      success: !hasErrors || hasUpdates, // Consider partial success as success
      message,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      statistics: {
        processedCount: result.processedCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        errorCount: result.errors.length
      },
      errors: result.errors.length > 0 ? result.errors : undefined
    }, { status: statusCode })

  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    console.error('💥 Fatal error in mite growth update cron job:', error)
    
    return NextResponse.json({
      success: false,
      message: `❌ Fatal error: ${errorMessage}`,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      statistics: {
        processedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errorCount: 1
      },
      errors: [errorMessage]
    }, { status: 500 })
  }
}

// Health check endpoint - can be used to verify the cron job is working
export async function HEAD() {
  return NextResponse.json({ 
    status: 'healthy', 
    endpoint: '/api/cron/mite-growth-update',
    description: 'Mite coefficient growth calculation cron job',
    method: 'GET'
  })
}