// Netlify serverless function — Resend email notifications
// Triggered by client-side fetch calls on key events

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL     = process.env.FROM_EMAIL || 'noreply@requestplatform.com'
const APP_URL        = process.env.APP_URL || 'https://requestplatform.netlify.app'

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: `Request Platform <${FROM_EMAIL}>`, to, subject, html }),
  })
  return res.json()
}

function baseTemplate(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: Inter, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #312e81; padding: 24px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; }
        .header p { color: #a5b4fc; margin: 4px 0 0; font-size: 13px; }
        .body { padding: 28px 32px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
        .button { display: inline-block; background: #4f46e5; color: #fff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 16px; }
        .detail-box { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #475569; }
        .detail-row strong { color: #1e293b; }
        .fee-total { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px; font-weight: 700; color: #1e293b; }
        .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Request</h1>
          <p>The Platform to Request Anything</p>
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Request Platform · You're receiving this because you have activity on Request.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return { statusCode: 200, body: JSON.stringify({ skipped: true }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { event: emailEvent, data } = body

  try {
    switch (emailEvent) {
      case 'new_request': {
        // Notify traveler of a new request on their trip
        const { travelerEmail, travelerName, requesterName, itemName, tripDestination, requestId, itemCost, finderFee, platformFee, total } = data
        await sendEmail({
          to: travelerEmail,
          subject: `New request on your ${tripDestination} trip — ${itemName}`,
          html: baseTemplate(`
            <p>Hi ${travelerName},</p>
            <p><strong>${requesterName}</strong> just submitted a request on your trip to <strong>${tripDestination}</strong>.</p>
            <div class="detail-box">
              <div class="detail-row"><span>Item</span><strong>${itemName}</strong></div>
              <div class="detail-row"><span>Item Cost</span><strong>$${parseFloat(itemCost).toFixed(2)}</strong></div>
              <div class="detail-row"><span>Finder's Fee</span><strong>$${parseFloat(finderFee).toFixed(2)}</strong></div>
              <div class="detail-row"><span>Platform Fee (10%)</span><strong>$${parseFloat(platformFee).toFixed(2)}</strong></div>
              <div class="detail-row fee-total"><span>Total</span><strong>$${parseFloat(total).toFixed(2)}</strong></div>
            </div>
            <p>Review the request and accept or decline it in your dashboard.</p>
            <a href="${APP_URL}/requests/${requestId}" class="button">View Request</a>
          `),
        })
        break
      }

      case 'request_accepted': {
        const { requesterEmail, requesterName, travelerName, itemName, tripDestination, requestId } = data
        await sendEmail({
          to: requesterEmail,
          subject: `Your request was accepted — ${itemName}`,
          html: baseTemplate(`
            <p>Hi ${requesterName},</p>
            <p>Great news! <strong>${travelerName}</strong> has accepted your request for <strong>${itemName}</strong> from their trip to <strong>${tripDestination}</strong>.</p>
            <p>You can now message the traveler to coordinate details.</p>
            <a href="${APP_URL}/requests/${requestId}" class="button">View Request & Message</a>
          `),
        })
        break
      }

      case 'request_declined': {
        const { requesterEmail, requesterName, itemName, tripDestination } = data
        await sendEmail({
          to: requesterEmail,
          subject: `Request update — ${itemName}`,
          html: baseTemplate(`
            <p>Hi ${requesterName},</p>
            <p>Unfortunately, the traveler was unable to fulfill your request for <strong>${itemName}</strong> on the <strong>${tripDestination}</strong> trip.</p>
            <p>Don't worry — there are plenty of other travelers heading there. Browse current trips to find another match.</p>
            <a href="${APP_URL}/trips" class="button">Browse More Trips</a>
          `),
        })
        break
      }

      case 'item_delivered': {
        const { requesterEmail, requesterName, travelerName, itemName, requestId } = data
        await sendEmail({
          to: requesterEmail,
          subject: `Your item is on its way — ${itemName}`,
          html: baseTemplate(`
            <p>Hi ${requesterName},</p>
            <p><strong>${travelerName}</strong> has marked your item <strong>${itemName}</strong> as delivered.</p>
            <p>Once you receive it, please confirm delivery in your dashboard to complete the transaction.</p>
            <a href="${APP_URL}/requests/${requestId}" class="button">Confirm Receipt</a>
          `),
        })
        break
      }

      case 'new_message': {
        const { recipientEmail, recipientName, senderName, requestId, itemName } = data
        await sendEmail({
          to: recipientEmail,
          subject: `New message from ${senderName} — ${itemName}`,
          html: baseTemplate(`
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> sent you a message about the request for <strong>${itemName}</strong>.</p>
            <a href="${APP_URL}/requests/${requestId}" class="button">Read Message</a>
          `),
        })
        break
      }

      default:
        return { statusCode: 400, body: `Unknown event: ${emailEvent}` }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('Email error:', err)
    return { statusCode: 500, body: err.message }
  }
}
