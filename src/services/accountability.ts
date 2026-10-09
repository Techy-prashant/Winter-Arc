export type CheckIn = {
  date: string; // YYYY-MM-DD
  study_duration_minutes: number;
  physical_activity_completed: boolean;
}

export type AccountabilityStats = {
  currentStreak: number;
  longestStreak: number;
  totalStudyMinutes: number;
  totalWorkouts: number;
  isAtRisk: boolean;
  leaderboardScore: number;
}

const formatDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

export function calculateAccountability(checkIns: CheckIn[], currentDateStr: string): AccountabilityStats {
  // Sort check-ins chronologically
  const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let totalStudy = 0;
  let totalWorkouts = 0;
  let lastCompletedDate: Date | null = null;

  // Split date string to avoid timezone parsing quirks
  const [cY, cM, cD] = currentDateStr.split('-').map(Number);
  const currentDate = new Date(cY, cM - 1, cD);

  const getDaysDiff = (d1: Date, d2: Date) => {
    return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
  };

  if (sorted.length > 0) {
    const [fY, fM, fD] = sorted[0].date.split('-').map(Number);
    const firstDate = new Date(fY, fM - 1, fD);
    
    const checkInMap = new Map<string, CheckIn>();
    for (const c of sorted) {
      checkInMap.set(c.date, c);
    }

    const iteratorDate = new Date(firstDate);
    
    while (iteratorDate <= currentDate) {
      const dateKey = formatDateKey(iteratorDate);
      const checkIn = checkInMap.get(dateKey);

      if (checkIn) {
        totalStudy += checkIn.study_duration_minutes;
        if (checkIn.physical_activity_completed) {
          totalWorkouts += 1;
        }

        const isCompleted = checkIn.study_duration_minutes >= 180;
        if (isCompleted) {
          currentStreak += 1;
          lastCompletedDate = new Date(iteratorDate);
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          if (dateKey !== currentDateStr) {
            currentStreak = 0;
          }
        }
      } else {
        if (dateKey !== currentDateStr) {
          currentStreak = 0;
        }
      }

      iteratorDate.setDate(iteratorDate.getDate() + 1);
    }
  }

  let isAtRisk = false;
  if (lastCompletedDate) {
    const daysSinceLast = getDaysDiff(currentDate, lastCompletedDate);
    if (daysSinceLast >= 3) {
      isAtRisk = true;
    }
  } else {
    if (sorted.length > 0) {
      const [fY, fM, fD] = sorted[0].date.split('-').map(Number);
      const firstDate = new Date(fY, fM - 1, fD);
      if (getDaysDiff(currentDate, firstDate) >= 3) {
        isAtRisk = true;
      }
    }
  }

  const studyHours = Math.floor(totalStudy / 60);
  const leaderboardScore = (currentStreak * 50) + (longestStreak * 20) + (totalWorkouts * 10) + (studyHours * 5);

  return {
    currentStreak,
    longestStreak,
    totalStudyMinutes: totalStudy,
    totalWorkouts,
    isAtRisk,
    leaderboardScore
  };
}
