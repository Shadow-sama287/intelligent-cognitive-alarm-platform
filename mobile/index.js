import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { startRedisSessionForAlarm } from './src/services/notificationService';

// ─────────────────────────────────────────────────────────
// Notifee Background Event Handler
// ─────────────────────────────────────────────────────────
// This runs when a notification fires while the app is killed or backgrounded.
// It MUST be registered at the top level (outside of any component).
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  console.log('[Notifee Background Event]', type, notification?.id);

  const isAlarmTriggerEvent =
    type === EventType.DELIVERED ||
    type === EventType.PRESS ||
    type === EventType.ACTION_PRESS;

  // Background session creation removed to prevent duplicate sessions.
  // GlobalAlarmManager handles session creation when the user interacts with or sees the alarm UI.
  if (isAlarmTriggerEvent && notification?.data?.alarm_id) {
    console.log(
      '[Notifee Background] Alarm triggered in background:',
      notification.data.alarm_id,
    );
  }

  // Handle user tapping notification or action buttons
  const isPressEvent = type === EventType.PRESS || type === EventType.ACTION_PRESS;
  if (isPressEvent && notification?.id) {
    try {
      await notifee.cancelNotification(notification.id);
    } catch (e) {
      console.warn('[Notifee Background] Failed to cancel notification:', e);
    }
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
