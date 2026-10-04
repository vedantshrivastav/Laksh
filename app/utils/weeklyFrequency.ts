import type { Expense, Category } from "../storage/useExpenseStore";

export type FrequencyObservation = {
  category: Category;
  count: number;
  total: number;
  weekKey: string; // used so the same observation isn't repeated within the same week
};

function startOfWeek(d: Date): Date {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Finds categories that have been logged `threshold` times or more
 * within the current week (Sunday to now).
 */
export function detectFrequentCategories(
  expenses: Expense[],
  threshold = 3
): FrequencyObservation[] {
  const weekStart = startOfWeek(new Date());
  const weekKey = weekStart.toISOString();

  const thisWeek = expenses.filter((e) => new Date(e.date) >= weekStart);

  const grouped: Record<string, { count: number; total: number }> = {};
  thisWeek.forEach((e) => {
    if (!grouped[e.category]) grouped[e.category] = { count: 0, total: 0 };
    grouped[e.category].count += 1;
    grouped[e.category].total += e.amount;
  });

  return Object.entries(grouped)
    .filter(([, v]) => v.count >= threshold)
    .map(([category, v]) => ({
      category: category as Category,
      count: v.count,
      total: v.total,
      weekKey,
    }))
    .sort((a, b) => b.count - a.count);
}