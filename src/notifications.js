import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, fromKey, pretty, todayKey } from './dates';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
const CHANNEL = 'reminders';

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function setupNotifications() {
  if (!isNative) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Period & pad reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E04F6B',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function notifyNow(title, body, data = {}) {
  if (!isNative) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
    });
  } catch (e) {
    console.warn('notifyNow failed', e);
  }
}

// Called every time the period history or pad stock changes.
// Clears old cycle reminders and schedules fresh ones for the next predicted period.
export async function scheduleCycleReminders({ nextStart, avgPeriod, settings, pads }) {
  if (!isNative) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.kind === 'cycle')
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    if (!nextStart) return;

    const needed = avgPeriod * (pads.perDay || 4);
    const lowStock = pads.count < needed;
    const stockLine = lowStock
      ? ` You have ${pads.count} ${pads.product.trim() || 'pads'} left – you may need about ${needed}. Order now so they arrive in time.`
      : '';

    const plan = [
      { day: settings.remindDaysBefore, title: 'Period coming soon', body: `Your period may start in ${settings.remindDaysBefore} days (around ${pretty(nextStart)}).${stockLine}` },
      { day: 1, title: 'Period likely tomorrow', body: `Keep a pad in your bag today.${stockLine}` },
      { day: 0, title: 'Period may start today', body: 'Tap to log it when it starts, so your next prediction gets more accurate.' },
    ];

    const seen = new Set();
    const today = todayKey();
    for (const item of plan) {
      if (seen.has(item.day)) continue;
      seen.add(item.day);
      const key = addDays(nextStart, -item.day);
      const when = fromKey(key);
      when.setHours(settings.reminderHour || 9, 0, 0, 0);
      if (key < today || when.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: item.title, body: item.body, data: { kind: 'cycle' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
      });
    }
  } catch (e) {
    console.warn('scheduleCycleReminders failed', e);
  }
}
