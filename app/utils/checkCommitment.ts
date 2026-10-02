import type { Expense, Category } from "../storage/useExpenseStore";
import type { Commitment } from "../storage/useCommitmentStore";
import type { Feedback } from "./expenseFeedback";
import DATA from "../constants/expenseData";

function startOfPeriod(period: "day" | "week"): Date {
  const d = new Date();
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // week: Sunday as start, matches getRewardStatus in streak.ts
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Call this right after addExpense. `expenses` must already include the new one.
 * Returns the first broken commitment as feedback, or null if nothing is broken.
 */
export function checkCommitmentViolations(
  category: Category,
  expenses: Expense[],
  commitments: Commitment[]
): Feedback | null {
  const relevant = commitments.filter((c) => c.category === category);
  if (relevant.length === 0) return null;

  const categoryLabel = DATA.find((d) => d.category === category)?.name ?? category;

  for (const rule of relevant) {
    const start = startOfPeriod(rule.period);
    const count = expenses.filter(
      (e) => e.category === category && new Date(e.date) >= start
    ).length;

    if (count > rule.maxCount) {
      const periodLabel = rule.period === "day" ? "today" : "this week";
      return {
        message: `That's ${count} ${categoryLabel} orders ${periodLabel} — past the limit of ${rule.maxCount} you set.`,
        tone: "warning",
      };
    }
  }
  return null;
}