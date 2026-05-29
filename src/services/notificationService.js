// notificationService.js
// Placeholder notification service — FCM tokens are saved via gardenService.saveFcmToken
// and notifications are sent by Firebase Cloud Functions (decayAgent, watererAgent).
// No client-side push registration is required for the current setup.

/**
 * Stub: request notification permissions on mobile.
 * Full implementation would use expo-notifications.
 */
export async function requestNotificationPermissions() {
  console.log('[notificationService] Notification permissions not yet configured.');
  return false;
}

/**
 * Stub: get current FCM push token.
 */
export async function getFcmToken() {
  console.log('[notificationService] FCM token retrieval not yet configured.');
  return null;
}
