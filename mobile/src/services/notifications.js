import * as Notifications from 'expo-notifications';

export const scheduleBedtimeNotification = async (targetWakeHour, targetWakeMinute) => {
  let bedtimeHour = targetWakeHour - 8;
  if (bedtimeHour < 0) bedtimeHour += 24;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌙 Time to Wind Down!",
      body: "To reach your 8-hour sleep goal for tomorrow's alarm, get ready for bed now.",
    },
    trigger: {
      hour: bedtimeHour,
      minute: targetWakeMinute,
      repeats: true,
    },
  });
};