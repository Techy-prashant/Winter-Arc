import test from 'node:test'
import assert from 'node:assert'
import { calculateAccountability, CheckIn } from './accountability'

test('Accountability Engine', async (t) => {
  const CURRENT_DATE = '2024-10-15'; // Mocked "today"

  await t.test('participant with no activity', () => {
    const stats = calculateAccountability([], CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 0);
    assert.strictEqual(stats.longestStreak, 0);
    assert.strictEqual(stats.totalStudyMinutes, 0);
    assert.strictEqual(stats.totalWorkouts, 0);
    assert.strictEqual(stats.isAtRisk, false); 
  });

  await t.test('first completed day', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-15', study_duration_minutes: 180, physical_activity_completed: true }
    ];
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 1);
    assert.strictEqual(stats.longestStreak, 1);
    assert.strictEqual(stats.totalStudyMinutes, 180);
    assert.strictEqual(stats.totalWorkouts, 1);
    assert.strictEqual(stats.isAtRisk, false);
  });

  await t.test('consecutive completed days', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-13', study_duration_minutes: 200, physical_activity_completed: true },
      { date: '2024-10-14', study_duration_minutes: 180, physical_activity_completed: false },
      { date: '2024-10-15', study_duration_minutes: 190, physical_activity_completed: true },
    ];
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 3);
    assert.strictEqual(stats.longestStreak, 3);
    assert.strictEqual(stats.totalStudyMinutes, 570);
    assert.strictEqual(stats.totalWorkouts, 2);
    assert.strictEqual(stats.isAtRisk, false);
  });

  await t.test('incomplete study requirement does not increase streak', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-14', study_duration_minutes: 180, physical_activity_completed: true },
      // Today is incomplete
      { date: '2024-10-15', study_duration_minutes: 120, physical_activity_completed: true },
    ];
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    // Streak is NOT broken today if it's the current date (allowance to finish the day)
    // Wait, the logic preserves streak for the *current day* if it's incomplete because they might still finish.
    assert.strictEqual(stats.currentStreak, 1); 
    assert.strictEqual(stats.totalStudyMinutes, 300);
    assert.strictEqual(stats.totalWorkouts, 2);
  });

  await t.test('broken streak via incomplete day in the past', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-12', study_duration_minutes: 180, physical_activity_completed: false }, // +1
      { date: '2024-10-13', study_duration_minutes: 180, physical_activity_completed: false }, // +1
      { date: '2024-10-14', study_duration_minutes: 179, physical_activity_completed: false }, // Broken (yesterday)
      { date: '2024-10-15', study_duration_minutes: 180, physical_activity_completed: false }, // +1 (today)
    ];
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 1);
    assert.strictEqual(stats.longestStreak, 2);
  });

  await t.test('missing day breaks streak', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-12', study_duration_minutes: 180, physical_activity_completed: false },
      { date: '2024-10-13', study_duration_minutes: 180, physical_activity_completed: false },
      // missing 14th
      { date: '2024-10-15', study_duration_minutes: 180, physical_activity_completed: false },
    ];
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 1);
    assert.strictEqual(stats.longestStreak, 2);
  });

  await t.test('inactivity detection - 3 days missing', () => {
    const checkIns: CheckIn[] = [
      { date: '2024-10-10', study_duration_minutes: 180, physical_activity_completed: false },
      { date: '2024-10-11', study_duration_minutes: 180, physical_activity_completed: false },
    ];
    // Current date is 15th. Last completed was 11th. Diff = 4 days.
    const stats = calculateAccountability(checkIns, CURRENT_DATE);
    assert.strictEqual(stats.currentStreak, 0);
    assert.strictEqual(stats.isAtRisk, true);
  });
});
