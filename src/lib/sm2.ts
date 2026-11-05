export type SM2Rating = 0 | 3 | 4 | 5;

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string; // 'YYYY-MM-DD'
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adds `days` to a date and returns YYYY-MM-DD
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Calculates next SM-2 state based on user rating quality (q = 0, 3, 4, 5)
 */
export function calculateSM2(
  currentState: SM2State,
  quality: SM2Rating,
  todayStr: string = getTodayDateString()
): SM2State {
  let { easeFactor, interval, repetitions } = currentState;
  const q = quality;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    // easeFactor formula: max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }

  // Round easeFactor to 2 decimal places for clean storage
  easeFactor = Math.round(easeFactor * 100) / 100;
  const nextDueDate = addDaysToDate(todayStr, interval);

  return {
    easeFactor,
    interval,
    repetitions,
    dueDate: nextDueDate,
  };
}

/**
 * Check if a card is due on or before today
 */
export function isCardDue(dueDate: string, todayStr: string = getTodayDateString()): boolean {
  if (!dueDate) return true;
  return dueDate <= todayStr;
}
