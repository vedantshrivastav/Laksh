import type { Expense } from "../storage/useExpenseStore";

export type Tier = "Assistant" | "Analyst" | "CFO" | "Oracle";

const ANALYST_AT = 7;
const CFO_AT = 30;
const ORACLE_AT = 90;

function uniqueLoggedDays(expenses: Expense[]): Set<string> {
  return new Set(expenses.map((e) => new Date(e.date).toDateString()));
}

/** Consecutive days up to today (or yesterday, if nothing logged today yet) with at least one expense. */
export function getCurrentStreak(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const days = uniqueLoggedDays(expenses);

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Longest run of consecutive logged days across all history. */
export function getLongestStreak(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const days = Array.from(uniqueLoggedDays(expenses))
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i] - days[i - 1]) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export function getTier(streak: number): {
  tier: Tier;
  next: Tier | null;
  daysToNext: number;
} {
  if (streak < ANALYST_AT) return { tier: "Assistant", next: "Analyst", daysToNext: ANALYST_AT - streak };
  if (streak < CFO_AT) return { tier: "Analyst", next: "CFO", daysToNext: CFO_AT - streak };
  if (streak < ORACLE_AT) return { tier: "CFO", next: "Oracle", daysToNext: ORACLE_AT - streak };
  return { tier: "Oracle", next: null, daysToNext: 0 };
}

/** Last 7 calendar days ending today, oldest first, with whether an expense was logged that day. */
export function getLastSevenDays(expenses: Expense[]) {
  const days = uniqueLoggedDays(expenses);
  const result: { letter: string; active: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    result.push({
      letter: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      active: days.has(d.toDateString()),
    });
  }
  return result;
}

export function getRewardStatus(expenses: Expense[], streak: number) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const loggedThisWeek = expenses.some((e) => new Date(e.date) >= startOfWeek);

  return {
    weeklyStoryReady: loggedThisWeek,
    moneyMindfulUnlocked: streak >= CFO_AT, // 30-day streak
    moneyMindfulProgress: Math.min(streak / CFO_AT, 1),
    spendingPersonalityUnlocked: streak >= ANALYST_AT, // 7-day streak
    financialNinjaUnlocked: streak >= ORACLE_AT, // 90-day streak
  };
}