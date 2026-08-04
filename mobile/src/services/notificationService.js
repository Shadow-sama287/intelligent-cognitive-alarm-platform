import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { mobileApi } from './api';

// ─────────────────────────────────────────────────────────
// 1. Permissions
// ─────────────────────────────────────────────────────────

/**
 * Requests OS notification permissions via Notifee.
 * Returns true if permission granted, false otherwise.
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  try {
    const settings = await notifee.requestPermission();
    // authorizationStatus >= 1 means AUTHORIZED or PROVISIONAL
    return settings.authorizationStatus >= 1;
  } catch (e) {
    console.error('[Notifee] Error requesting permissions:', e);
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// 2. Notification Channel (Android)
// ─────────────────────────────────────────────────────────

/**
 * Creates a high-priority Android notification channel for alarms.
 * On iOS, channels are not used — returns 'default'.
 */
export async function createAlarmChannel() {
  if (Platform.OS !== 'android') return 'default';

  return await notifee.createChannel({
    id: 'icap_alarm_channel_v3',
    name: 'ICAP Full Screen Alarms',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: true,
  });
}

// ─────────────────────────────────────────────────────────
// 3. Time Utilities
// ─────────────────────────────────────────────────────────

/**
 * Calculates the next trigger timestamp (in ms) for an alarm time string "HH:MM".
 * If the time has already passed today, schedules for tomorrow.
 */
function getNextTriggerTimestamp(alarmTimeStr) {
  if (!alarmTimeStr) return null;
  const parts = alarmTimeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;

  const [hours, minutes] = parts;
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hours, minutes, 0, 0);

  // If the alarm time has already passed today, schedule for tomorrow
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger.getTime();
}

// ─────────────────────────────────────────────────────────
// 4. Schedule / Cancel Alarms
// ─────────────────────────────────────────────────────────

/**
 * Schedules an exact alarm with Full-Screen Intent using Notifee.
 *
 * Key Android features:
 * - alarmManager.allowWhileIdle: fires even in Doze / Battery Saver mode
 * - fullScreenAction: wakes screen + shows over lock screen
 * - AndroidCategory.ALARM: OS treats this as a real alarm (priority handling)
 * - ongoing + autoCancel:false: user cannot swipe it away
 */
export async function scheduleLocalAlarmNotification(alarm) {
  if (!alarm || !alarm.is_active || !alarm.alarm_time) return;

  const notificationId = `alarm-${alarm.id}`;

  // Cancel any existing notification for this alarm first
  await cancelAlarmNotification(alarm.id);

  const timestamp = getNextTriggerTimestamp(alarm.alarm_time);
  if (!timestamp) return;

  const channelId = await createAlarmChannel();

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: timestamp,
    alarmManager: {
      allowWhileIdle: true, // Survives Android Doze mode
    },
  };

  try {
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: `⏰ ${alarm.title || 'Alarm Ringing!'}`,
        body: 'Time to wake up! Complete your cognitive challenge.',
        data: {
          alarm_id: String(alarm.id),
          category: alarm.challenge_category || 'math',
          type: 'LOCAL_ALARM_TRIGGER',
        },
        android: {
          channelId: channelId,
          category: AndroidCategory.ALARM,
          importance: AndroidImportance.HIGH,
          // Full-Screen Intent — wakes screen and shows over lock screen
          fullScreenAction: {
            id: 'default',
            launchActivity: 'default',
          },
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          ongoing: true,
          autoCancel: false,
          actions: [
            {
              title: 'Solve Challenge',
              pressAction: { 
                id: 'solve',
                launchActivity: 'default',
              },
            },
          ],
        },
      },
      trigger,
    );
    console.log(
      `[Notifee] Scheduled alarm ${alarm.id} → ${new Date(timestamp).toLocaleString()}`,
    );
    return notificationId;
  } catch (error) {
    console.error(`[Notifee] Error scheduling alarm ${alarm.id}:`, error);
  }
}

/**
 * Cancels a scheduled Notifee alarm notification by alarm ID.
 */
export async function cancelAlarmNotification(alarmId) {
  try {
    await notifee.cancelNotification(`alarm-${alarmId}`);
  } catch (e) {
    // Silently ignore if not scheduled
  }
}

/**
 * Cancels any displayed or triggered notification by its exact notification ID.
 */
export async function cancelNotificationById(notificationId) {
  if (!notificationId) return;
  try {
    await notifee.cancelNotification(notificationId);
    console.log(`[Notifee] Cancelled displayed notification: ${notificationId}`);
  } catch (e) {
    console.error(`[Notifee] Error cancelling notification ${notificationId}:`, e);
  }
}

/**
 * Cancels all currently displayed notifications in the status bar tray.
 */
export async function cancelAllDisplayedNotifications() {
  try {
    await notifee.cancelAllNotifications();
    console.log('[Notifee] Cancelled all displayed notifications');
  } catch (e) {
    console.error('[Notifee] Error cancelling all notifications:', e);
  }
}


// ─────────────────────────────────────────────────────────
// 5. Bulk Sync
// ─────────────────────────────────────────────────────────

/**
 * Syncs all database alarms with OS-level Notifee triggers.
 * Cancels all existing triggers first, then re-schedules active ones.
 */
export async function syncAllAlarms(alarmsList) {
  if (!Array.isArray(alarmsList)) return;

  try {
    // Cancel all existing scheduled triggers
    const triggerNotificationIds = await notifee.getTriggerNotificationIds();
    for (const id of triggerNotificationIds) {
      await notifee.cancelNotification(id);
    }

    // Re-schedule only active alarms
    for (const alarm of alarmsList) {
      if (alarm.is_active) {
        await scheduleLocalAlarmNotification(alarm);
      }
    }

    console.log(`[Notifee] Synced ${alarmsList.filter(a => a.is_active).length} active alarms`);
  } catch (e) {
    console.error('[Notifee] Error syncing alarms:', e);
  }
}

// ─────────────────────────────────────────────────────────
// 6. Test Alarm (Debug)
// ─────────────────────────────────────────────────────────

/**
 * Triggers a test alarm notification N seconds from now.
 * Useful for quick debugging of full-screen intent and sound.
 */
export async function triggerTestAlarm(alarm, delaySeconds = 5) {
  const timestamp = Date.now() + delaySeconds * 1000;
  const channelId = await createAlarmChannel();
  const notificationId = `test-alarm-${alarm?.id || Date.now()}`;

  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: timestamp,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  return await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: `⏰ ${alarm?.title || 'Test Alarm Ringing!'}`,
      body: 'Wake up! Complete your cognitive challenge to turn off the alarm.',
      data: {
        alarm_id: String(alarm?.id || 1),
        category: alarm?.challenge_category || 'math',
        type: 'LOCAL_ALARM_TRIGGER',
      },
      android: {
        channelId: channelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        fullScreenAction: {
          id: 'default',
          launchActivity: 'default',
        },
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        ongoing: true,
        autoCancel: false,
        actions: [
          {
            title: 'Solve Challenge',
            pressAction: {
              id: 'solve',
              launchActivity: 'default',
            },
          },
        ],
      },
    },
    trigger,
  );
}

// ─────────────────────────────────────────────────────────
// 7. Backend Session Helper
// ─────────────────────────────────────────────────────────

/**
 * Calls FastAPI backend to start a Redis-backed alarm session.
 * This creates a cognitive challenge session when an alarm fires.
 */
export async function startRedisSessionForAlarm(alarmId, category = 'math') {
  try {
    const res = await mobileApi.post('/sessions/start', null, {
      params: {
        alarm_id: alarmId,
        category: category,
      },
      timeout: 3000,
    });
    return res.data.data;
  } catch (error) {
    console.log('[NotificationService] Server session creation failed/offline. Falling back to local challenge:', error?.message);
    const { generateLocalChallenge } = require('./localChallengeEngine');
    const localChallenge = generateLocalChallenge(category, 'medium');
    return {
      session_id: `local-session-${Date.now()}`,
      is_local: true,
      challenge: localChallenge,
    };
  }
}
