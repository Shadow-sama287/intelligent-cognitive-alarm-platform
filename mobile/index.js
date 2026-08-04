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

  // When alarm triggers in background, start a Redis session for the challenge
  if (isAlarmTriggerEvent && notification?.data?.alarm_id) {
    try {
      await startRedisSessionForAlarm(
        notification.data.alarm_id,
        notification.data.category || 'math',
      );
      console.log(
        '[Notifee Background] Created Redis session for alarm:',
        notification.data.alarm_id,
      );
    } catch (e) {
      console.error('[Notifee Background] Failed to create Redis session:', e);
    }
  }

  // Handle user tapping notification or action buttons
  const isPressEvent = type === EventType.PRESS || type === EventType.ACTION_PRESS;
  if (isPressEvent && notification?.id) {
    try {
      await notifee.cancelNotification(notification.id);
    } catch (e) {}
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
