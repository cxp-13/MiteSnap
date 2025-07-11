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