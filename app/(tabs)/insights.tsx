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

// ── Types ─────────────────────────────────────────────────

type Period = "week" | "month" | "3m";

type CategoryData = {
  name: string;
  amount: number;
  color: string;
  total: number;
};

type PatternData = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  value: string;
  valueColor?: string;
};

type InsightData = {
  period: Period;
  totalSpent: number;
  vsLast: number;
  vsLastPositive: boolean;
  aiInsight: string;
  aiTip: string;
  categories: CategoryData[];
  patterns: PatternData[];
};

// ── Dummy Data ────────────────────────────────────────────

const DUMMY_INSIGHTS: Record<Period, InsightData> = {
  week: {
    period: "week",
    totalSpent: 2840,
    vsLast: 320,
    vsLastPositive: false,
    aiInsight:
      "You spent ₹980 on food delivery this week — 3 Swiggy orders in 5 days. At this rate you'll spend ₹4,200 this month on food alone.",
    aiTip:
      "Try cooking twice this week. That alone saves ₹600 toward your Japan goal.",
    categories: [
      { name: "Food & Drink", amount: 980, color: "#E8A045", total: 2840 },
      { name: "Transport", amount: 640, color: "#4CAF82", total: 2840 },
      { name: "Shopping", amount: 720, color: "#5DCAA5", total: 2840 },
      { name: "Bills", amount: 300, color: "#8A8F9E", total: 2840 },
      { name: "Others", amount: 200, color: "#444854", total: 2840 },
    ],
    patterns: [
      {
        id: "1",
        emoji: "📅",
        title: "Highest spend day",
        subtitle: "You spent 2x more on Saturday",
        value: "Sat",
      },
      {
        id: "2",
        emoji: "🛵",
        title: "Top merchant",
        subtitle: "Ordered 3 times this week",
        value: "Swiggy",
      },
      {
        id: "3",
        emoji: "⚡",
        title: "Impulse spends",
        subtitle: "1 day with 5+ small purchases",
        value: "₹340",
        valueColor: colors.danger,
      },
    ],
  },
  month: {
    period: "month",
    totalSpent: 11240,
    vsLast: 820,
    vsLastPositive: true,
    aiInsight:
      "You spent ₹4,200 on food delivery this month — 38% of your total. Cutting Swiggy to 3x/week saves ₹1,800/month — that's your Japan goal 46 days faster.",
    aiTip:
      "Try cooking on weekdays. Your spending spikes on Tuesday and Thursday evenings consistently.",
    categories: [
      { name: "Food & Drink", amount: 4200, color: "#E8A045", total: 11240 },
      { name: "Transport", amount: 1960, color: "#4CAF82", total: 11240 },
      { name: "Shopping", amount: 1580, color: "#5DCAA5", total: 11240 },
      { name: "Bills", amount: 1240, color: "#8A8F9E", total: 11240 },
      { name: "Others", amount: 840, color: "#444854", total: 11240 },
    ],
    patterns: [
      {
        id: "1",
        emoji: "📅",
        title: "Highest spend day",
        subtitle: "You spend 2x more on Saturdays than weekdays",
        value: "Sat",
      },
      {
        id: "2",
        emoji: "🛵",
        title: "Top merchant",
        subtitle: "Ordered 11 times this month",
        value: "Swiggy",
      },
      {
        id: "3",
        emoji: "⚡",
        title: "Impulse spends",
        subtitle: "3 days with 5+ small purchases",
        value: "₹1,340",
        valueColor: colors.danger,
      },
    ],
  },
  "3m": {
    period: "3m",
    totalSpent: 34200,
    vsLast: 2400,
    vsLastPositive: true,
    aiInsight:
      "Over 3 months your food spending has grown 18% month on month. You're saving ₹2,400 more than 3 months ago — solid progress toward your Japan goal.",
    aiTip:
      "Your best month was April — ₹1,200 less on dining out. Replicate that pattern this month.",
    categories: [
      { name: "Food & Drink", amount: 12400, color: "#E8A045", total: 34200 },
      { name: "Transport", amount: 6200, color: "#4CAF82", total: 34200 },
      { name: "Shopping", amount: 7800, color: "#5DCAA5", total: 34200 },
      { name: "Bills", amount: 4200, color: "#8A8F9E", total: 34200 },
      { name: "Others", amount: 3600, color: "#444854", total: 34200 },
    ],
    patterns: [
      {
        id: "1",
        emoji: "📅",
        title: "Most expensive month",
        subtitle: "June was your highest spend month",
        value: "June",
      },
      {
        id: "2",
        emoji: "🛵",
        title: "Top merchant",
        subtitle: "Spent across 28 orders total",
        value: "Swiggy",
      },
      {
        id: "3",
        emoji: "⚡",
        title: "Impulse spends",
        subtitle: "Total across 3 months",
        value: "₹4,200",
        valueColor: colors.danger,
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getBarWidth(amount: number, total: number) {
  return `${Math.round((amount / total) * 100)}%`;
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
  vsLast: number;
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
          { color: vsLastPositive ? colors.success : colors.danger },
        ]}
      >
        {vsLastPositive ? "↓" : "↑"} {formatAmount(vsLast)}{" "}
        {vsLastPositive ? "less" : "more"} than last{" "}
        {period === "3m" ? "quarter" : period}
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
                {
                  width: getBarWidth(cat.amount, cat.total),
                  backgroundColor: cat.color,
                },
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

import { useState } from "react";
import Header from "../common/Header";

export default function Insights() {
  const [period, setPeriod] = useState<Period>("month");

  // TODO: replace with real data from useExpenseStore()
  const data = DUMMY_INSIGHTS[period];
  const hasData = true; // TODO: check if real expenses exist

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
            <AIInsightCard insight={data.aiInsight} tip={data.aiTip} />

            {/* Total Spend */}
            <TotalCard
              amount={data.totalSpent}
              vsLast={data.vsLast}
              vsLastPositive={data.vsLastPositive}
              period={period}
            />

            {/* Category Breakdown */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>By category</Text>
            </View>
            <CategoryBreakdown categories={data.categories} />

            {/* Patterns */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Spending patterns</Text>
            </View>
            {data.patterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
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
