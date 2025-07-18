import { NextRequest, NextResponse } from 'next/server'
import { updateDuvetStatus } from '@/lib/database'
import { createSunDryRecord } from '@/lib/clean-history'
import { getClerkUserById } from '@/lib/clerk-server'
import { sendSelfDryingStartEmail } from '@/lib/email'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      duvetId, 
      currentMiteScore,
      startTime,
      endTime,
      predictedMiteScore
    } = await req.json()
    
    if (!duvetId || currentMiteScore === undefined || !startTime || !endTime || predictedMiteScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('=== Starting sun drying process ===')
    console.log('User ID:', userId)
    console.log('Duvet ID:', duvetId)

    // Get duvet information
    const { data: duvet, error: duvetError } = await supabase
      .from('quilts')
      .select('name')
      .eq('id', duvetId)
      .single()

    if (duvetError || !duvet) {
      console.error('Error fetching duvet:', duvetError)
      return NextResponse.json({ error: 'Duvet not found' }, { status: 404 })
    }

    console.log('Duvet name:', duvet.name)

    // Create sun dry record
    const sunDryRecord = await createSunDryRecord(
      duvetId,
      userId,
      currentMiteScore,
      startTime,
      endTime,
      predictedMiteScore
    )

    if (!sunDryRecord) {
      return NextResponse.json({ error: 'Failed to create sun dry record' }, { status: 500 })
    }

    // Update duvet status to waiting for optimal time
    await updateDuvetStatus(duvetId, 'waiting_optimal_time')

    // Send start notification email
    try {
      console.log('=== Attempting to send start email ===')
      console.log('Getting user information for userId:', userId)
      
      const clerkUser = await getClerkUserById(userId)
      console.log('Clerk user retrieved:', clerkUser)
      console.log('User email:', clerkUser?.email)
      console.log('User name:', clerkUser?.name)
      
      if (clerkUser?.email) {
        console.log('Sending email to:', clerkUser.email)
        
        const emailSent = await sendSelfDryingStartEmail({
          userEmail: clerkUser.email,
          userName: clerkUser.name,
          duvetName: duvet.name,
          startTime: startTime,
          endTime: endTime,
          currentMiteScore: currentMiteScore,
          predictedMiteScore: predictedMiteScore
        })
        
        if (emailSent) {
          console.log('✅ Successfully sent self-drying start email to', clerkUser.email)
        } else {
          console.error('❌ Failed to send self-drying start email')
        }
      } else {
        console.error('❌ No email found for user', userId)
        console.error('Clerk user object:', JSON.stringify(clerkUser, null, 2))
      }
    } catch (emailError) {
      console.error('❌ Error sending self-drying start email:', emailError)
      console.error('Error details:', emailError instanceof Error ? emailError.message : 'Unknown error')
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({ 
      success: true,
      sunDryRecord
    })
  } catch (error) {
    console.error('Error starting sun drying:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}