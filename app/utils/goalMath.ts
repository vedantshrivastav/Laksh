import type { Goal } from "../storage/useGoalStore";

export function goalStats(g: Goal) {
  const remaining = Math.max(g.targetAmount - g.savedAmount, 0);
  const daysLeft = Math.max(
    Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / 86400000), 0
  );
  const progress = g.targetAmount > 0 ? Math.min(g.savedAmount / g.targetAmount, 1) : 0;
  return {
    remaining,
    daysLeft,
    progress,
    percent: Math.round(progress * 100),
    perDay: daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining,
    perWeek: daysLeft > 0 ? Math.ceil(remaining / Math.max(daysLeft / 7, 1)) : remaining,
  };
}