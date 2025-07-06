import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { updateDuvetStatus, updateOrderStatus } from '@/lib/database'
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

    // Get all duvets in waiting_pickup status
    const { data: duvets, error } = await supabase
      .from('quilts')
      .select('id, status')
      .eq('status', 'waiting_pickup')

    if (error) {
      console.error('Error fetching waiting pickup duvets:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch waiting pickup duvets',
          ...result
        },
        { status: 500 }
      )
    }

    if (!duvets || duvets.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duvets in waiting_pickup status',
        ...result
      })
    }

    // Get pending orders for these duvets
    const duvetIds = duvets.map(d => d.id)
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, quilt_id, created_at, status')
      .in('quilt_id', duvetIds)
      .eq('status', 'pending')

    if (orderError) {
      console.error('Error fetching pending orders:', orderError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch pending orders',
          ...result
        },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending orders found',
        ...result
      })
    }

    const now = new Date()
    const thirtyMinutesInMs = 30 * 60 * 1000

    // Check each order for timeout
    for (const order of orders) {
      try {
        result.processedCount++
        
        const createdAt = new Date(order.created_at)
        const timeSinceCreated = now.getTime() - createdAt.getTime()

        // If more than 30 minutes since order creation, timeout
        if (timeSinceCreated > thirtyMinutesInMs) {
          console.log(`Timing out order ${order.id} for duvet ${order.quilt_id} - waited ${Math.floor(timeSinceCreated / 60000)} minutes`)
          
          // Reset duvet status to normal
          const duvetUpdated = await updateDuvetStatus(order.quilt_id, 'normal')
          
          // Cancel the order
          const orderUpdated = await updateOrderStatus(order.id, 'cancelled')
          
          // Delete related clean history records (unfinished ones)
          const cleanRecordsDeleted = await deleteCleanHistoryByDuvetId(order.quilt_id)
          if (cleanRecordsDeleted) {
            result.cleanRecordsDeleted++
          }
          
          if (duvetUpdated && orderUpdated) {
            result.updatedCount++
          }
        }
      } catch (error) {
        const errorMessage = `Error processing order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMessage)
        result.errors.push(errorMessage)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} orders, cancelled ${result.updatedCount} due to timeout, deleted ${result.cleanRecordsDeleted} clean records`,
      ...result
    })

  } catch (error) {
    console.error('Error in help-drying pickup timeout check:', error)
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