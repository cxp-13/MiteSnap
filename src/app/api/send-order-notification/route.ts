import { NextRequest, NextResponse } from 'next/server'
import { sendOrderNotificationEmail, OrderNotificationData } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const data: OrderNotificationData = await request.json()
    
    // Validate required fields
    if (!data.orderId || !data.userId || !data.duvetName || !data.createdAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const success = await sendOrderNotificationEmail(data)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-order-notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}