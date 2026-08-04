import { NativeModules, Platform } from 'react-native';
import * as NotifeeService from './notificationService';

const { AlarmModule } = NativeModules;

/**
 * Universal Native Alarm Service
 * Bridge between React Native and custom Kotlin Native AlarmManager module,
 * with automatic fallback to Notifee trigger notifications for Expo / dev environments.
 */

export const isNativeModuleAvailable = () => {
  return Platform.OS === 'android' && AlarmModule != null;
};

/**
 * Schedules an exact alarm via Kotlin AlarmModule or Notifee fallback.
 */
export async function scheduleAlarm(alarm) {
  if (!alarm || !alarm.is_active || !alarm.alarm_time) return;

  const alarmId = String(alarm.id);
  const timeStr = alarm.alarm_time; // "HH:MM"
  const category = alarm.challenge_category || 'math';
  const title = alarm.title || 'Alarm Ringing!';

  if (isNativeModuleAvailable()) {
    try {
      console.log(`[NativeAlarm] Scheduling exact alarm ${alarmId} for ${timeStr} via Kotlin module`);
      await AlarmModule.scheduleAlarm(alarmId, timeStr, title, category);
      return `native-${alarmId}`;
    } catch (e) {
      console.error('[NativeAlarm] Native module failed, falling back to Notifee:', e);
    }
  }

  // Fallback to Notifee local trigger notification
  return await NotifeeService.scheduleLocalAlarmNotification(alarm);
}

/**
 * Cancels a scheduled alarm.
 */
export async function cancelAlarm(alarmId) {
  if (!alarmId) return;
  const idStr = String(alarmId);

  if (isNativeModuleAvailable()) {
    try {
      await AlarmModule.cancelAlarm(idStr);
    } catch (e) {
      console.error('[NativeAlarm] Error cancelling native alarm:', e);
    }
  }

  // Also cancel Notifee trigger if set
  await NotifeeService.cancelAlarmNotification(idStr);
}

/**
 * Stops ongoing ringing audio / vibration service.
 */
export async function stopRingtone() {
  if (isNativeModuleAvailable()) {
    try {
      await AlarmModule.stopRingtone();
      console.log('[NativeAlarm] Native ringtone service stopped.');
    } catch (e) {
      console.error('[NativeAlarm] Error stopping native ringtone:', e);
    }
  }

  // Clear any active Notifee notification status bar alerts
  await NotifeeService.cancelAllDisplayedNotifications();
}

/**
 * Syncs active alarms array.
 */
export async function syncAllAlarms(alarmsList) {
  if (!Array.isArray(alarmsList)) return;

  for (const alarm of alarmsList) {
    if (alarm.is_active) {
      await scheduleAlarm(alarm);
    } else {
      await cancelAlarm(alarm.id);
    }
  }
}
