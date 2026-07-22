import { mobileApi } from './api';

export const logSolveTelemetry = async ({ category, difficulty, solveTimeSeconds, attempts, snoozeCount }) => {
  try {
    await mobileApi.post('/telemetry/solve', {
      category,
      difficulty,
      solve_time_seconds: solveTimeSeconds,
      attempts,
      snooze_count: snoozeCount,
    });
  } catch (e) {
    console.error('Telemetry log failed:', e);
  }
};