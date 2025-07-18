import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface OrderNotificationData {
  orderId: string
  userId: string
  duvetName: string
  address: string
  createdAt: string
  cost?: number | null
}

export interface DryingCompletionData {
  userEmail: string
  userName: string | null
  duvetName: string
  completedAt: string
}

export interface HelpDryingCompletionData {
  userEmail: string
  userName: string | null
  duvetName: string
  completedAt: string
  helperName?: string | null
}

export interface SelfDryingStartData {
  userEmail: string
  userName: string | null
  duvetName: string
  startTime: string
  endTime: string
  currentMiteScore: number
  predictedMiteScore: number
}

export interface SelfDryingReminderData {
  userEmail: string
  userName: string | null
  duvetName: string
  startTime: string
  endTime: string
}

export async function sendDryingCompletionEmail(data: DryingCompletionData) {
  try {
    console.log('Starting drying completion email send process...')
    console.log('Drying completion data:', data)
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY)

    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: [data.userEmail],
      subject: `Your duvet drying is complete - ${data.duvetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">✨ Duvet Drying Complete!</h2>
          
          <p>Hello ${data.userName || 'there'},</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Good news!</h3>
            <p>Your duvet <strong>"${data.duvetName}"</strong> has finished the drying process and is now ready.</p>
            <p><strong>Completed at:</strong> ${new Date(data.completedAt).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563;">
              <strong>What's next?</strong><br>
              Your duvet should now have significantly reduced mite levels and be fresh and clean. 
              Make sure to store it in a clean, dry place to maintain its freshness.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using MiteSnap!<br>
            <em>Keep your bedding mite-free and healthy.</em>
          </p>
        </div>
      `,
    }

    console.log('Drying completion email payload:', JSON.stringify(emailPayload, null, 2))

    const { data: emailResult, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Resend API error details for drying completion:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      return false
    }

    console.log('Drying completion email sent successfully!')
    console.log('Resend response:', emailResult)
    return true
  } catch (error) {
    console.error('Caught exception during drying completion email send:', error)
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

export async function sendOrderNotificationEmail(data: OrderNotificationData) {
  try {
    console.log('Starting email send process...')
    console.log('Order data:', data)
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY)

    const adminEmail = process.env.ADMIN_EMAIL || 'lantianlaoli@gmail.com'
    
    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: [adminEmail],
      subject: `新的帮晒订单 - ${data.duvetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">新的帮晒订单通知</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">订单详情</h3>
            <p><strong>订单ID:</strong> ${data.orderId}</p>
            <p><strong>用户ID:</strong> ${data.userId}</p>
            <p><strong>被褥名称:</strong> ${data.duvetName}</p>
            <p><strong>地址:</strong> ${data.address}</p>
            <p><strong>下单时间:</strong> ${new Date(data.createdAt).toLocaleString('zh-CN')}</p>
            ${data.cost ? `<p><strong>费用:</strong> ¥${data.cost}</p>` : ''}
          </div>
          
          <p style="color: #6b7280;">请及时处理这个新订单。</p>
        </div>
      `,
    }

    console.log('Email payload:', JSON.stringify(emailPayload, null, 2))

    const { data: emailResult, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Resend API error details:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      return false
    }

    console.log('Email sent successfully!')
    console.log('Resend response:', emailResult)
    return true
  } catch (error) {
    console.error('Caught exception during email send:', error)
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

export async function sendHelpDryingCompletionEmail(data: HelpDryingCompletionData) {
  try {
    console.log('Starting help-drying completion email send process...')
    console.log('Help-drying completion data:', data)
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY)

    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: [data.userEmail],
      subject: `Your duvet help-drying service is complete - ${data.duvetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">✨ Help-Drying Service Complete!</h2>
          
          <p>Hello ${data.userName || 'there'},</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Great news!</h3>
            <p>Your duvet <strong>"${data.duvetName}"</strong> has been successfully dried by our helper${data.helperName ? ` <strong>${data.helperName}</strong>` : ''}.</p>
            <p><strong>Completed at:</strong> ${new Date(data.completedAt).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563;">
              <strong>What's next?</strong><br>
              Your duvet has been professionally dried and should now have significantly reduced mite levels. 
              It's fresh, clean, and ready to use! Please retrieve it at your earliest convenience.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for using MiteSnap's help-drying service!<br>
            <em>We're here to keep your bedding mite-free and healthy.</em>
          </p>
        </div>
      `,
    }

    console.log('Help-drying completion email payload:', JSON.stringify(emailPayload, null, 2))

    const { data: emailResult, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Resend API error details for help-drying completion:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      return false
    }

    console.log('Help-drying completion email sent successfully!')
    console.log('Resend response:', emailResult)
    return true
  } catch (error) {
    console.error('Caught exception during help-drying completion email send:', error)
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

export async function sendSelfDryingStartEmail(data: SelfDryingStartData) {
  try {
    console.log('Starting self-drying start email send process...')
    console.log('Self-drying start data:', data)
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY)
    console.log('User email:', data.userEmail)
    console.log('User name:', data.userName)

    const startDate = new Date(data.startTime)
    const endDate = new Date(data.endTime)
    
    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: [data.userEmail],
      subject: `Sun drying started for ${data.duvetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">☀️ Sun Drying Started!</h2>
          
          <p>Hello ${data.userName || 'there'},</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #d97706;">Your duvet is ready to dry!</h3>
            <p>You've started the sun drying process for <strong>"${data.duvetName}"</strong>.</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>🕐 Drying window:</strong></p>
              <p style="margin: 5px 0 5px 20px;">Start: ${startDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 5px 0 5px 20px;">End: ${endDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>🦟 Mite reduction prediction:</strong></p>
              <p style="margin: 5px 0 5px 20px;">Current mite score: <span style="color: #dc2626; font-weight: bold;">${data.currentMiteScore}</span></p>
              <p style="margin: 5px 0 5px 20px;">Predicted after drying: <span style="color: #16a34a; font-weight: bold;">${data.predictedMiteScore}</span></p>
              <p style="margin: 10px 0 5px 20px; color: #059669;">Expected reduction: ${Math.round(((data.currentMiteScore - data.predictedMiteScore) / data.currentMiteScore) * 100)}%</p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563;">
              <strong>💡 Tips for effective sun drying:</strong><br>
              • Ensure your duvet is fully exposed to direct sunlight<br>
              • Flip it halfway through for even drying<br>
              • Bring it in before the end time to avoid moisture
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            We'll notify you when the drying process is complete!<br>
            <em>Happy sun drying! ☀️</em>
          </p>
        </div>
      `,
    }

    console.log('Self-drying start email payload:', JSON.stringify(emailPayload, null, 2))

    const { data: emailResult, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Resend API error details for self-drying start:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      return false
    }

    console.log('Self-drying start email sent successfully!')
    console.log('Resend response:', emailResult)
    return true
  } catch (error) {
    console.error('Caught exception during self-drying start email send:', error)
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

export async function sendSelfDryingReminderEmail(data: SelfDryingReminderData) {
  try {
    console.log('Starting self-drying reminder email send process...')
    console.log('Self-drying reminder data:', data)
    console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY)

    const startDate = new Date(data.startTime)
    const endDate = new Date(data.endTime)
    
    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: [data.userEmail],
      subject: `Time to dry your duvet - ${data.duvetName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">⏰ It's Time to Dry Your Duvet!</h2>
          
          <p>Hello ${data.userName || 'there'},</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #d97706;">Your optimal drying time has arrived!</h3>
            <p>The sun drying window for <strong>"${data.duvetName}"</strong> has begun.</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>🕐 Drying window:</strong></p>
              <p style="margin: 5px 0 5px 20px;">Start: ${startDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 5px 0 5px 20px;">End: ${endDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
          
          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1;">
              <strong>🌞 Quick reminder:</strong><br>
              • Place your duvet in direct sunlight now<br>
              • The drying process has automatically started<br>
              • Remember to flip it halfway through for even drying
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Your duvet status has been updated to "drying".<br>
            <em>Enjoy the fresh, mite-free results!</em>
          </p>
        </div>
      `,
    }

    console.log('Self-drying reminder email payload:', JSON.stringify(emailPayload, null, 2))

    const { data: emailResult, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('Resend API error details for self-drying reminder:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error))
      return false
    }

    console.log('Self-drying reminder email sent successfully!')
    console.log('Resend response:', emailResult)
    return true
  } catch (error) {
    console.error('Caught exception during self-drying reminder email send:', error)
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}