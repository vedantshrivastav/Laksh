import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  fontSize,
  fontFamily,
  spacing,
  radius,
} from "../constants/theme";
import Header from "../common/Header";
import { useExpenseStore } from "../storage/useExpenseStore";
import type { Expense } from "../storage/useExpenseStore";
import DATA from "../constants/expenseData";
import { getRange, getPreviousRange, type Period } from "../utils/dataRange";
// import { getRange, getPreviousRange, type Period } from "../utils/dateRanges";

// ── Types ─────────────────────────────────────────────────

type CategoryData = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

type PatternData = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  value: string;
  valueColor?: string;
};

// ── Helpers ───────────────────────────────────────────────

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const CATEGORY_COLORS = [
  "#E8A045",
  "#4CAF82",
  "#5DCAA5",
  "#8A8F9E",
  "#444854",
  "#7C8CF8",
];

function categoryBreakdown(list: Expense[]): CategoryData[] {
  const totals: Record<string, number> = {};
  list.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const total = list.reduce((s, e) => s + e.amount, 0);

  return Object.entries(totals)
    .map(([category, amount], i) => ({
      name: DATA.find((d) => d.category === category)?.name ?? category,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);
}

function buildPatterns(list: Expense[]): PatternData[] {
  if (list.length === 0) return [];
  const patterns: PatternData[] = [];

  // Highest spend day of the week
  const dayTotals: Record<string, number> = {};
  list.forEach((e) => {
    const day = new Date(e.date).toLocaleDateString("en-US", {
      weekday: "short",
    });
    dayTotals[day] = (dayTotals[day] || 0) + e.amount;
  });
  const topDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
  if (topDay) {
    patterns.push({
      id: "day",
      emoji: "📅",
      title: "Highest spend day",
      subtitle: `You spent ${formatAmount(topDay[1])} on ${topDay[0]}s`,
      value: topDay[0],
    });
  }

  // Most frequent category
  const countByCategory: Record<string, number> = {};
  list.forEach((e) => {
    countByCategory[e.category] = (countByCategory[e.category] || 0) + 1;
  });
  const topCat = Object.entries(countByCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    const label = DATA.find((d) => d.category === topCat[0])?.name ?? topCat[0];
    patterns.push({
      id: "category",
      emoji: "🔁",
      title: "Most frequent category",
      subtitle: `${topCat[1]} transaction${topCat[1] > 1 ? "s" : ""} logged`,
      value: label,
    });
  }

  // Busy days: 3+ transactions in a single day
  const dayGroups: Record<string, { count: number; amount: number }> = {};
  list.forEach((e) => {
    const day = new Date(e.date).toDateString();
    if (!dayGroups[day]) dayGroups[day] = { count: 0, amount: 0 };
    dayGroups[day].count += 1;
    dayGroups[day].amount += e.amount;
  });
  const busyDays = Object.values(dayGroups).filter((d) => d.count >= 3);
  if (busyDays.length > 0) {
    const busyTotal = busyDays.reduce((s, d) => s + d.amount, 0);
    patterns.push({
      id: "busy",
      emoji: "⚡",
      title: "Busy spend days",
      subtitle: `${busyDays.length} day${busyDays.length > 1 ? "s" : ""} with 3+ transactions`,
      value: formatAmount(busyTotal),
      valueColor: colors.danger,
    });
  }

  return patterns;
}

// ── Period Toggle ─────────────────────────────────────────

function PeriodToggle({
  selected,
  onSelect,
}: {
  selected: Period;
  onSelect: (p: Period) => void;
}) {
  const options: { key: Period; label: string }[] = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "3m", label: "3M" },
  ];

  return (
    <View style={styles.toggleContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          style={[
            styles.toggleBtn,
            selected === opt.key && styles.toggleBtnActive,
          ]}
          onPress={() => onSelect(opt.key)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.toggleText,
              selected === opt.key && styles.toggleTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── AI Insight Card ───────────────────────────────────────

function AIInsightCard({ insight, tip }: { insight: string; tip: string }) {
  return (
    <View style={styles.aiCard}>
      <Text style={styles.aiBadge}>✦ LAKSH ANALYST · AI INSIGHT</Text>
      <Text style={styles.aiText}>{insight}</Text>
      <View style={styles.aiTip}>
        <Text style={styles.aiTipText}>💡 {tip}</Text>
      </View>
    </View>
  );
}

// ── Total Spend Card ──────────────────────────────────────

function TotalCard({
  amount,
  vsLast,
  vsLastPositive,
  period,
}: {
  amount: number;
  vsLast: number | null;
  vsLastPositive: boolean;
  period: Period;
}) {
  const periodLabel =
    period === "week"
      ? "This week"
      : period === "month"
        ? "This month"
        : "Last 3 months";

  return (
    <View style={styles.totalCard}>
      <Text style={styles.totalLabel}>{periodLabel}</Text>
      <Text style={styles.totalAmount}>{formatAmount(amount)}</Text>
      <Text
        style={[
          styles.totalVs,
          vsLast !== null && {
            color: vsLastPositive ? colors.success : colors.danger,
          },
        ]}
      >
        {vsLast === null
          ? "Not enough history to compare yet"
          : `${vsLastPositive ? "↓" : "↑"} ${formatAmount(vsLast)} ${
              vsLastPositive ? "less" : "more"
            } than last ${period === "3m" ? "quarter" : period}`}
      </Text>
    </View>
  );
}

// ── Category Breakdown ────────────────────────────────────

function CategoryBreakdown({ categories }: { categories: CategoryData[] }) {
  return (
    <View style={styles.categoryCard}>
      {categories.map((cat, index) => (
        <View
          key={cat.name}
          style={[
            styles.categoryRow,
            index === categories.length - 1 && { marginBottom: 0 },
          ]}
        >
          <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
          <Text style={styles.categoryName}>{cat.name}</Text>
          <View style={styles.categoryBarTrack}>
            <View
              style={[
                styles.categoryBarFill,
                { width: `${cat.percent}%`, backgroundColor: cat.color },
              ]}
            />
          </View>
          <Text style={styles.categoryAmount}>{formatAmount(cat.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Pattern Card ──────────────────────────────────────────

function PatternCard({ pattern }: { pattern: PatternData }) {
  return (
    <View style={styles.patternCard}>
      <View style={styles.patternIcon}>
        <Text style={styles.patternEmoji}>{pattern.emoji}</Text>
      </View>
      <View style={styles.patternInfo}>
        <Text style={styles.patternTitle}>{pattern.title}</Text>
        <Text style={styles.patternSub}>{pattern.subtitle}</Text>
      </View>
      <Text
        style={[
          styles.patternValue,
          pattern.valueColor ? { color: pattern.valueColor } : {},
        ]}
      >
        {pattern.value}
      </Text>
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>No insights yet</Text>
      <Text style={styles.emptySub}>
        Log expenses for a few days and Laksh will start showing you patterns.
      </Text>
    </View>
  );
}

// ── Insights Screen ───────────────────────────────────────

export default function Insights() {
  const [period, setPeriod] = useState<Period>("month");
  const expenses = useExpenseStore((s) => s.expenses);

  const { start, end } = getRange(period);
  const { start: pStart, end: pEnd } = getPreviousRange(period);

  const current = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  const previous = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= pStart && d <= pEnd;
  });

  const total = current.reduce((s, e) => s + e.amount, 0);
  const prevTotal = previous.reduce((s, e) => s + e.amount, 0);
  const vsLast = prevTotal > 0 ? Math.abs(total - prevTotal) : null;
  const vsLastPositive = prevTotal > 0 ? total <= prevTotal : true;

  const categories = categoryBreakdown(current);
  const patterns = buildPatterns(current);
  const topCategory = categories[0];
  const hasData = current.length > 0;

  const aiInsight = !hasData
    ? "Log a few expenses this period and Laksh will start spotting patterns for you."
    : vsLast === null
      ? `You've spent ${formatAmount(total)} so far. Keep logging to unlock period comparisons.`
      : vsLastPositive
        ? `You spent ${formatAmount(vsLast)} less than last ${period === "3m" ? "quarter" : period}. Solid progress.`
        : `You spent ${formatAmount(vsLast)} more than last ${period === "3m" ? "quarter" : period}${
            topCategory ? `, mostly on ${topCategory.name}` : ""
          }.`;

  const aiTip = !hasData
    ? "Add your first expense to start building insights."
    : topCategory && topCategory.percent > 40
      ? `${topCategory.name} makes up ${topCategory.percent}% of your spending. Try setting a soft limit there.`
      : "Your spending looks fairly balanced across categories.";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <View style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <PeriodToggle selected={period} onSelect={setPeriod} />
        </View>

        {!hasData ? (
          <EmptyState />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* AI Insight */}
            <AIInsightCard insight={aiInsight} tip={aiTip} />

            {/* Total Spend */}
            <TotalCard
              amount={total}
              vsLast={vsLast}
              vsLastPositive={vsLastPositive}
              period={period}
            />

            {/* Category Breakdown */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>By category</Text>
            </View>
            <CategoryBreakdown categories={categories} />

            {/* Patterns */}
            {patterns.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Spending patterns</Text>
                </View>
                {patterns.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  // Toggle
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 3,
    gap: 2,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.background,
  },

  // AI Card
  aiCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  aiBadge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  aiText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  aiTip: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  aiTipText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Total Card
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  totalLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  totalVs: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },

  // Section
  sectionRow: {
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },

  // Category
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  categoryName: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    width: 90,
  },
  categoryBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceBorder,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  categoryAmount: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 52,
    textAlign: "right",
  },

  // Pattern Card
  patternCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  patternIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    flexShrink: 0,
  },
  patternEmoji: {
    fontSize: 20,
  },
  patternInfo: {
    flex: 1,
  },
  patternTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  patternSub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  patternValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.accent,
    flexShrink: 0,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xxxl,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
