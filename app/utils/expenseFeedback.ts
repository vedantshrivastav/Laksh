import type { Goal } from "../storage/useGoalStore";

export type FeedbackTone = "warning" | "info" | "success";

export type Feedback = {
  message: string;
  tone: FeedbackTone;
};

function goalPerDay(goal: Goal): number {
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const daysLeft = Math.max(
    Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000),
    1
  );
  return remaining / daysLeft;
}

export function generateExpenseFeedback(params: {
  amount: number;
  categoryLabel: string;
  monthlyBudget: number;
  monthTotalAfter: number; // month total INCLUDING this new expense
  activeGoal?: Goal;
}): Feedback {
  const { amount, categoryLabel, monthlyBudget, monthTotalAfter, activeGoal } = params;

  const percent = monthlyBudget > 0 ? (monthTotalAfter / monthlyBudget) * 100 : 0;

  // Priority 1: already over budget
  if (monthlyBudget > 0 && percent >= 100) {
    const over = monthTotalAfter - monthlyBudget;
    return {
      message: `You've gone ₹${Math.round(over).toLocaleString("en-IN")} over your monthly budget. Time to slow down.`,
      tone: "warning",
    };
  }

  // Priority 2: close to the limit
  if (monthlyBudget > 0 && percent >= 85) {
    return {
      message: `Heads up, you're at ${Math.round(percent)}% of your monthly budget after this ${categoryLabel} expense.`,
      tone: "warning",
    };
  }

  // Priority 3: goal trade-off, if there's an active goal with a real daily target
  if (activeGoal && !activeGoal.isCompleted) {
    const perDay = goalPerDay(activeGoal);
    if (perDay > 0) {
      const daysImpact = Math.round(amount / perDay);
      if (daysImpact >= 1) {
        return {
          message: `This ₹${Math.round(amount).toLocaleString("en-IN")} ${categoryLabel} expense is about ${daysImpact} day${
            daysImpact > 1 ? "s" : ""
          } of saving toward ${activeGoal.emoji} ${activeGoal.name}.`,
          tone: "info",
        };
      }
    }
  }

  // Priority 4: gentle default
  return {
    message: `Logged ₹${Math.round(amount).toLocaleString("en-IN")} for ${categoryLabel}. Keep it up!`,
    tone: "success",
  };
}