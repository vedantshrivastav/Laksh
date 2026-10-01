import type { Expense, Category } from "../storage/useExpenseStore";
import type { Goal } from "../storage/useGoalStore";
import DATA from "../constants/expenseData";
import { getRange, type Period } from "./dataRange";
import { getCurrentStreak } from "./streak";


type AgentContext = {
  expenses: Expense[];
  goals: Goal[];
  activeGoalId: string | null;
  monthlyBudget: number;
};

function formatAmount(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// Map every known word/alias to a Category id
const CATEGORY_ALIASES: Record<string, Category> = {};
DATA.forEach((d) => {
  CATEGORY_ALIASES[d.name.toLowerCase()] = d.category;
  CATEGORY_ALIASES[d.category.toLowerCase()] = d.category;
});
// A few extra common words users might type
CATEGORY_ALIASES["coffee"] = "chai";
CATEGORY_ALIASES["swiggy"] = "food";
CATEGORY_ALIASES["zomato"] = "food";
CATEGORY_ALIASES["uber"] = "transport";
CATEGORY_ALIASES["ola"] = "transport";

function detectCategory(text: string): Category | null {
  for (const alias in CATEGORY_ALIASES) {
    if (text.includes(alias)) return CATEGORY_ALIASES[alias];
  }
  return null;
}

function detectPeriod(text: string): { period: Period; label: string } {
  if (text.includes("today")) return { period: "week", label: "today" }; // handled specially below
  if (text.includes("3 month") || text.includes("quarter") || text.includes("3m"))
    return { period: "3m", label: "the last 3 months" };
  if (text.includes("week")) return { period: "week", label: "this week" };
  return { period: "month", label: "this month" };
}

function filterByPeriod(expenses: Expense[], text: string): { list: Expense[]; label: string } {
  if (text.includes("today")) {
    const today = new Date().toDateString();
    return {
      list: expenses.filter((e) => new Date(e.date).toDateString() === today),
      label: "today",
    };
  }
  const { period, label } = detectPeriod(text);
  const { start, end } = getRange(period);
  return {
    list: expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    }),
    label,
  };
}

export function answerQuery(rawText: string, ctx: AgentContext): string {
  const text = rawText.toLowerCase().trim();
  const { expenses, goals, activeGoalId, monthlyBudget } = ctx;

  // Streak
  if (text.includes("streak")) {
    const streak = getCurrentStreak(expenses);
    return streak === 0
      ? "No active streak yet. Log an expense today to start one."
      : `You're on a ${streak}-day logging streak. Keep it going!`;
  }

  // Budget
  if (text.includes("budget")) {
    const { list } = filterByPeriod(expenses, "month");
    const spent = list.reduce((s, e) => s + e.amount, 0);
    const left = Math.max(monthlyBudget - spent, 0);
    const percent = monthlyBudget > 0 ? Math.round((spent / monthlyBudget) * 100) : 0;
    return `You've used ${formatAmount(spent)} of your ${formatAmount(
      monthlyBudget
    )} monthly budget (${percent}%). ${formatAmount(left)} left.`;
  }

  // Goals
  if (text.includes("goal")) {
    const named = goals.find((g) => text.includes(g.name.toLowerCase()));
    const goal = named ?? goals.find((g) => g.id === activeGoalId);
    if (!goal) return "You don't have any goals set up yet. Add one from the Goals tab.";

    const percent = goal.targetAmount > 0
      ? Math.round((goal.savedAmount / goal.targetAmount) * 100)
      : 0;
    const daysLeft = Math.max(
      Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000),
      0
    );
    return `${goal.emoji} ${goal.name}: ${formatAmount(goal.savedAmount)} of ${formatAmount(
      goal.targetAmount
    )} saved (${percent}%), ${daysLeft} days left.`;
  }

  // Category-specific spend
  const category = detectCategory(text);
  if (category) {
    const { list, label } = filterByPeriod(expenses, text);
    const catList = list.filter((e) => e.category === category);
    const total = catList.reduce((s, e) => s + e.amount, 0);
    const catLabel = DATA.find((d) => d.category === category)?.name ?? category;

    if (catList.length === 0) {
      return `You haven't spent anything on ${catLabel} ${label}.`;
    }
    return `You spent ${formatAmount(total)} on ${catLabel} ${label} across ${catList.length} transaction${
      catList.length > 1 ? "s" : ""
    }.`;
  }

  // General total spend
  if (text.includes("spend") || text.includes("spent") || text.includes("total")) {
    const { list, label } = filterByPeriod(expenses, text);
    const total = list.reduce((s, e) => s + e.amount, 0);
    if (list.length === 0) return `No expenses logged ${label}.`;
    return `You spent ${formatAmount(total)} ${label} across ${list.length} transaction${
      list.length > 1 ? "s" : ""
    }.`;
  }

  // Fallback
  return "I can tell you about your spending, budget, goals, or streak. Try asking something like \"How much did I spend on chai this week?\" or \"How's my MacBook goal going?\"";
}