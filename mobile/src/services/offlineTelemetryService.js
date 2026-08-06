import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi } from './api';

const OFFLINE_QUEUE_KEY = '@icap_offline_telemetry_queue_v1';
let isSyncing = false;

/**
 * Saves a solve telemetry event locally when offline.
 */
export async function queueOfflineTelemetry(data) {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = existing ? JSON.parse(existing) : [];

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: data.category || 'math',
      difficulty: data.difficulty || 'medium',
      solve_time_seconds: data.solve_time_seconds || 10,
      attempts: data.attempts || 1,
      snooze_count: data.snooze_count || 0,
      timestamp: data.timestamp || new Date().toISOString(),
      is_offline: true,
    };

    queue.push(record);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log(`[Offline Telemetry] Queued record (${queue.length} pending in storage)`);
  } catch (error) {
    console.error('[Offline Telemetry] Failed to queue record:', error);
  }
}

/**
 * Reads pending offline telemetry queue from storage.
 */
export async function getPendingTelemetryQueue() {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('[Offline Telemetry] Failed to read queue:', error);
    return [];
  }
}

/**
 * Attempts to sync all queued offline telemetry records to the backend.
 * Flushes queue upon 200 OK server response.
 */
export async function syncOfflineTelemetry() {
  if (isSyncing) {
    console.log('[Offline Telemetry] Sync already in progress, skipping duplicate call.');
    return 0;
  }
  isSyncing = true;
  try {
    const queue = await getPendingTelemetryQueue();
    if (!queue || queue.length === 0) return 0;

    console.log(`[Offline Telemetry] Attempting batch sync for ${queue.length} records...`);

    const response = await mobileApi.post('/telemetry/batch', queue);
    
    if (response?.status === 200 || response?.status === 201) {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log(`[Offline Telemetry] Successfully synced & cleared ${queue.length} records.`);
      return queue.length;
    }
  } catch (error) {
    console.warn('[Offline Telemetry] Sync deferred (network unavailable or auth pending):', error?.message || error);
    return 0;
  } finally {
    isSyncing = false;
  }
}
