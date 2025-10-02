import nodemailer from 'nodemailer'
import { Service, ServiceStatus, Status } from '@prisma/client'

// Email configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Development: Use Ethereal Email for testing
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass',
      },
    })
  }
}

// Service status change notification
export async function sendServiceStatusNotification(
  service: Service,
  oldStatus: Status | null,
  newStatus: ServiceStatus,
  recipients: string[]
) {
  if (recipients.length === 0) return

  const transporter = createTransporter()

  const statusEmoji = {
    ONLINE: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
    OFFLINE: '🔴'
  }

  const statusColor = {
    ONLINE: '#16a34a',
    WARNING: '#ca8a04',
    ERROR: '#dc2626',
    OFFLINE: '#6b7280'
  }

  const subject = `${statusEmoji[newStatus.status]} ${service.name} - Status Changed to ${newStatus.status}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Service Status Alert</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .service-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
        }
        .details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="service-icon">${service.icon || '🔧'}</div>
          <h1>${service.name}</h1>
          <div class="status-badge" style="background-color: ${statusColor[newStatus.status]}">
            ${statusEmoji[newStatus.status]} ${newStatus.status}
          </div>
        </div>

        <div class="details">
          <div class="detail-row">
            <strong>Service URL:</strong>
            <span>${service.url}</span>
          </div>
          <div class="detail-row">
            <strong>Category:</strong>
            <span>${service.category}</span>
          </div>
          ${oldStatus ? `
          <div class="detail-row">
            <strong>Previous Status:</strong>
            <span>${statusEmoji[oldStatus]} ${oldStatus}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <strong>Response Time:</strong>
            <span>${newStatus.responseTime}ms</span>
          </div>
          <div class="detail-row">
            <strong>Checked At:</strong>
            <span>${new Date(newStatus.checkedAt).toLocaleString()}</span>
          </div>
          ${newStatus.statusCode ? `
          <div class="detail-row">
            <strong>Status Code:</strong>
            <span>${newStatus.statusCode}</span>
          </div>
          ` : ''}
          ${newStatus.errorMessage ? `
          <div class="detail-row">
            <strong>Error Message:</strong>
            <span style="color: #dc2626;">${newStatus.errorMessage}</span>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://eniolabi.com'}/dashboard" class="cta-button">
            View Dashboard
          </a>
        </div>

        <div class="footer">
          <p>This is an automated notification from Eniolabi Service Hub</p>
          <p>Designed by Damilare Eniolabi @damoojeje</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
Service Status Alert

Service: ${service.name} (${service.icon || '🔧'})
Status: ${statusEmoji[newStatus.status]} ${newStatus.status}
URL: ${service.url}
Category: ${service.category}
${oldStatus ? `Previous Status: ${statusEmoji[oldStatus]} ${oldStatus}` : ''}
Response Time: ${newStatus.responseTime}ms
Checked At: ${new Date(newStatus.checkedAt).toLocaleString()}
${newStatus.statusCode ? `Status Code: ${newStatus.statusCode}` : ''}
${newStatus.errorMessage ? `Error: ${newStatus.errorMessage}` : ''}

View Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://eniolabi.com'}/dashboard

---
This is an automated notification from Eniolabi Service Hub
Designed by Damilare Eniolabi @damoojeje
  `

  try {
    const info = await transporter.sendMail({
      from: `"Eniolabi Service Hub" <${process.env.SMTP_FROM || 'noreply@eniolabi.com'}>`,
      to: recipients.join(', '),
      subject,
      text: textContent,
      html: htmlContent,
    })

    console.log(`📧 Email sent successfully: ${info.messageId}`)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('📧 Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

// Send system alert emails
export async function sendSystemAlert(
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error',
  recipients: string[]
) {
  if (recipients.length === 0) return

  const transporter = createTransporter()

  const severityEmoji = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨'
  }

  const severityColor = {
    info: '#2563eb',
    warning: '#ca8a04',
    error: '#dc2626'
  }

  const subject = `${severityEmoji[severity]} ${title}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>System Alert</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .alert-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background-color: ${severityColor[severity]}20;
          border: 2px solid ${severityColor[severity]}40;
        }
        .alert-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .alert-title {
          color: ${severityColor[severity]};
          margin: 0;
        }
        .message {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="alert-header">
          <div class="alert-icon">${severityEmoji[severity]}</div>
          <h1 class="alert-title">${title}</h1>
          <p style="margin: 10px 0 0 0; color: #6b7280;">
            ${new Date().toLocaleString()}
          </p>
        </div>

        <div class="message">${message}</div>

        <div class="footer">
          <p>This is an automated alert from Eniolabi Service Hub</p>
          <p>Designed by Damilare Eniolabi @damoojeje</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Eniolabi Service Hub" <${process.env.SMTP_FROM || 'noreply@eniolabi.com'}>`,
      to: recipients.join(', '),
      subject,
      text: `${title}\n\n${message}\n\nSent at: ${new Date().toLocaleString()}`,
      html: htmlContent,
    })

    console.log(`📧 System alert sent successfully: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('📧 System alert sending failed:', error)
    return { success: false, error: error.message }
  }
}