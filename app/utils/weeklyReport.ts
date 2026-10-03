import type { Expense } from "../storage/useExpenseStore";
import DATA from "../constants/expenseData";

export type WeeklyReport = {
  weekKey: string; // unique id for the week this report covers
  total: number;
  prevTotal: number;
  changePercent: number | null;
  topCategoryLabel: string | null;
  topCategoryAmount: number;
  topCategoryPercent: number;
  dayCount: number; // how many distinct days had a logged expense
  message: string;
};

/** Sunday 00:00 of the week containing `d`, used as a stable key for "has this week been shown". */
function startOfWeek(d: Date): Date {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getWeekKey(d: Date): string {
  return startOfWeek(d).toISOString();
}

/** The most recently completed full week (the one just before the current one). */
function getLastCompletedWeekRange() {
  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(currentWeekStart.getTime() - 1); // Saturday 23:59:59.999

  const weekBeforeStart = new Date(lastWeekStart);
  weekBeforeStart.setDate(lastWeekStart.getDate() - 7);
  const weekBeforeEnd = new Date(lastWeekStart.getTime() - 1);

  return { lastWeekStart, lastWeekEnd, weekBeforeStart, weekBeforeEnd };
}

export function generateWeeklyReport(expenses: Expense[]): WeeklyReport | null {
  const { lastWeekStart, lastWeekEnd, weekBeforeStart, weekBeforeEnd } =
    getLastCompletedWeekRange();

  const lastWeek = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  if (lastWeek.length === 0) return null; // nothing to report

  const weekBefore = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= weekBeforeStart && d <= weekBeforeEnd;
  });

  const total = lastWeek.reduce((s, e) => s + e.amount, 0);
  const prevTotal = weekBefore.reduce((s, e) => s + e.amount, 0);
  const changePercent =
    prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  const byCategory: Record<string, number> = {};
  lastWeek.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const topEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topCategoryLabel = topEntry
    ? DATA.find((d) => d.category === topEntry[0])?.name ?? topEntry[0]
    : null;
  const topCategoryAmount = topEntry ? topEntry[1] : 0;
  const topCategoryPercent = topEntry && total > 0 ? Math.round((topEntry[1] / total) * 100) : 0;

  const dayCount = new Set(lastWeek.map((e) => new Date(e.date).toDateString())).size;

  const changeLine =
    changePercent === null
      ? ""
      : changePercent >= 0
        ? ` That's ${changePercent}% more than the week before.`
        : ` That's ${Math.abs(changePercent)}% less than the week before, nice work.`;

  const message = topCategoryLabel
    ? `You spent ₹${Math.round(total).toLocaleString("en-IN")} last week across ${dayCount} day${
        dayCount > 1 ? "s" : ""
      }. ${topCategoryLabel} led at ${topCategoryPercent}% of your spending.${changeLine}`
    : `You spent ₹${Math.round(total).toLocaleString("en-IN")} last week.${changeLine}`;

  return {
    weekKey: getWeekKey(lastWeekStart),
    total,
    prevTotal,
    changePercent,
    topCategoryLabel,
    topCategoryAmount,
    topCategoryPercent,
    dayCount,
    message,
  };
}