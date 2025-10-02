import { db } from './db'
import { sendServiceStatusNotification, sendSystemAlert } from './email'
import { Service, ServiceStatus, Status, User, NotificationPreference } from '@prisma/client'

// Get users who should receive notifications for a specific service
export async function getNotificationRecipients(
  serviceId: string,
  notificationType: 'statusChange' | 'onlineToOffline' | 'offlineToOnline' | 'errorAlert' | 'warningAlert' | 'systemAlert'
): Promise<User[]> {
  const users = await db.user.findMany({
    where: {
      isActive: true,
      role: {
        in: ['ADMIN', 'POWER_USER'] // Only admins and power users get notifications
      }
    },
    include: {
      notificationPreferences: true
    }
  })

  // Filter users based on their notification preferences
  return users.filter(user => {
    const prefs = user.notificationPreferences
    
    // If no preferences exist, use defaults (all enabled for admins)
    if (!prefs) {
      return user.role === 'ADMIN'
    }

    // Check if email notifications are enabled
    if (!prefs.emailEnabled) return false

    // Check specific notification type preferences
    switch (notificationType) {
      case 'statusChange':
        return prefs.statusChanges
      case 'onlineToOffline':
        return prefs.onlineToOffline
      case 'offlineToOnline':
        return prefs.offlineToOnline
      case 'errorAlert':
        return prefs.errorAlerts
      case 'warningAlert':
        return prefs.warningAlerts
      case 'systemAlert':
        return prefs.systemAlerts
      default:
        return false
    }
  })
}

// Process service status change and send notifications if needed
export async function processServiceStatusChange(
  service: Service,
  oldStatus: Status | null,
  newStatus: ServiceStatus
) {
  // Determine if we should send notifications
  const shouldNotify = shouldSendNotification(oldStatus, newStatus.status)
  
  if (!shouldNotify) {
    console.log(`📧 No notification needed for ${service.name}: ${oldStatus} -> ${newStatus.status}`)
    return
  }

  // Determine notification type
  let notificationType: 'statusChange' | 'onlineToOffline' | 'offlineToOnline' | 'errorAlert' | 'warningAlert'
  
  if (oldStatus === 'ONLINE' && (newStatus.status === 'OFFLINE' || newStatus.status === 'ERROR')) {
    notificationType = 'onlineToOffline'
  } else if ((oldStatus === 'OFFLINE' || oldStatus === 'ERROR') && newStatus.status === 'ONLINE') {
    notificationType = 'offlineToOnline'
  } else if (newStatus.status === 'ERROR') {
    notificationType = 'errorAlert'
  } else if (newStatus.status === 'WARNING') {
    notificationType = 'warningAlert'
  } else {
    notificationType = 'statusChange'
  }

  // Get recipients
  const recipients = await getNotificationRecipients(service.id, notificationType)
  
  if (recipients.length === 0) {
    console.log(`📧 No notification recipients for ${service.name} status change`)
    return
  }

  const emailAddresses = recipients.map(user => user.email)
  
  console.log(`📧 Sending notification for ${service.name} (${oldStatus} -> ${newStatus.status}) to ${emailAddresses.length} recipients`)

  // Send email notification
  const result = await sendServiceStatusNotification(
    service,
    oldStatus,
    newStatus,
    emailAddresses
  )

  if (result.success) {
    console.log(`📧 Successfully sent notification for ${service.name}`)
  } else {
    console.error(`📧 Failed to send notification for ${service.name}:`, result.error)
  }

  return result
}

// Determine if a notification should be sent based on status change
function shouldSendNotification(oldStatus: Status | null, newStatus: Status): boolean {
  // Always notify on first status check
  if (oldStatus === null) {
    return newStatus !== 'ONLINE' // Only notify if first check is not ONLINE
  }

  // Don't notify if status hasn't changed
  if (oldStatus === newStatus) {
    return false
  }

  // Always notify for these significant changes
  const significantChanges = [
    // Service going down
    { from: 'ONLINE', to: 'OFFLINE' },
    { from: 'ONLINE', to: 'ERROR' },
    { from: 'WARNING', to: 'OFFLINE' },
    { from: 'WARNING', to: 'ERROR' },
    
    // Service recovering
    { from: 'OFFLINE', to: 'ONLINE' },
    { from: 'ERROR', to: 'ONLINE' },
    { from: 'OFFLINE', to: 'WARNING' },
    { from: 'ERROR', to: 'WARNING' },
    
    // New issues
    { from: 'ONLINE', to: 'WARNING' },
  ]

  return significantChanges.some(change => 
    change.from === oldStatus && change.to === newStatus
  )
}

// Send system-wide alerts
export async function sendSystemNotification(
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
) {
  const recipients = await getNotificationRecipients('', 'systemAlert')
  
  if (recipients.length === 0) {
    console.log('📧 No recipients for system notification')
    return
  }

  const emailAddresses = recipients.map(user => user.email)
  
  console.log(`📧 Sending system alert "${title}" to ${emailAddresses.length} recipients`)

  const result = await sendSystemAlert(title, message, severity, emailAddresses)

  if (result.success) {
    console.log(`📧 Successfully sent system alert: ${title}`)
  } else {
    console.error(`📧 Failed to send system alert:`, result.error)
  }

  return result
}

// Create default notification preferences for a new user
export async function createDefaultNotificationPreferences(userId: string, role: string) {
  const defaults = {
    emailEnabled: true,
    statusChanges: role === 'ADMIN' || role === 'POWER_USER',
    onlineToOffline: true,
    offlineToOnline: role === 'ADMIN' || role === 'POWER_USER',
    errorAlerts: true,
    warningAlerts: role === 'ADMIN',
    systemAlerts: role === 'ADMIN' || role === 'POWER_USER',
  }

  return await db.notificationPreference.create({
    data: {
      userId,
      ...defaults
    }
  })
}