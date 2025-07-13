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

    const emailPayload = {
      from: 'MiteSnap <hello@mitesnap.com>',
      to: ['lantianlaoli@gmail.com'],
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