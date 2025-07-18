import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus, updateDuvetStatus } from '@/lib/database'
import { completeSunDryRecord, updateDuvetMiteScore } from '@/lib/clean-history'
import { getClerkUserById } from '@/lib/clerk-server'
import { sendHelpDryingCompletionEmail } from '@/lib/email'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, orderData } = await req.json()
    
    if (!orderId || !orderData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update order status to completed
    const orderUpdated = await updateOrderStatus(orderId, 'completed')
    if (!orderUpdated) {
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // Update duvet status to normal
    await updateDuvetStatus(orderData.quilt_id, 'normal')

    // Handle clean history update
    if (orderData.clean_history_id) {
      try {
        const completedRecord = await completeSunDryRecord(orderData.clean_history_id)
        
        if (completedRecord && completedRecord.after_mite_score !== null) {
          await updateDuvetMiteScore(orderData.quilt_id, completedRecord.after_mite_score)
        }
      } catch (error) {
        console.error('Error updating clean history:', error)
      }
    }

    // Send completion email notification
    try {
      const clerkUser = await getClerkUserById(orderData.user_id)
      
      if (clerkUser?.email) {
        let helperName: string | null = null
        if (orderData.service_user_id) {
          const helperUser = await getClerkUserById(orderData.service_user_id)
          helperName = helperUser?.name || null
        }
        
        const emailSent = await sendHelpDryingCompletionEmail({
          userEmail: clerkUser.email,
          userName: clerkUser.name,
          duvetName: orderData.duvet_name || 'Your duvet',
          completedAt: new Date().toISOString(),
          helperName: helperName
        })
        
        if (emailSent) {
          console.log(`Successfully sent help-drying completion email for order ${orderId}`)
        } else {
          console.error(`Failed to send help-drying completion email for order ${orderId}`)
        }
      }
    } catch (emailError) {
      console.error(`Error sending help-drying completion email:`, emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}