import type { Expense, Category } from "../storage/useExpenseStore";

export type RecurringPattern = {
  category: Category;
  weekday: number; // 0 (Sun) - 6 (Sat)
  occurrences: number;
  avgAmount: number;
};

/** Monday-based week key so two expenses in the same week are grouped together. */
function weekKeyOf(date: Date): string {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Finds category + weekday combinations that show up in at least `minWeeks`
 * distinct weeks, e.g. "Transport, most Mondays, for the last 4 weeks."
 */
export function detectRecurringPatterns(
  expenses: Expense[],
  minWeeks = 3
): RecurringPattern[] {
  type GroupKey = string; // `${category}-${weekday}`
  const groups: Record<GroupKey, { weeks: Set<string>; amounts: number[] }> = {};

  expenses.forEach((e) => {
    const d = new Date(e.date);
    const weekday = d.getDay();
    const key: GroupKey = `${e.category}-${weekday}`;
    if (!groups[key]) groups[key] = { weeks: new Set(), amounts: [] };
    groups[key].weeks.add(weekKeyOf(d));
    groups[key].amounts.push(e.amount);
  });

  const patterns: RecurringPattern[] = [];
  Object.entries(groups).forEach(([key, data]) => {
    if (data.weeks.size >= minWeeks) {
      const [category, weekdayStr] = key.split("-");
      const avg = data.amounts.reduce((s, a) => s + a, 0) / data.amounts.length;
      patterns.push({
        category: category as Category,
        weekday: parseInt(weekdayStr, 10),
        occurrences: data.weeks.size,
        avgAmount: avg,
      });
    }
  });

  return patterns;
}

/** Patterns that match today's weekday — what Home should actually show. */
export function getTodayPatterns(expenses: Expense[], minWeeks = 3): RecurringPattern[] {
  const todayWeekday = new Date().getDay();
  return detectRecurringPatterns(expenses, minWeeks).filter(
    (p) => p.weekday === todayWeekday
  );
}