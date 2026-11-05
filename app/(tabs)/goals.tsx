import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Header from "../common/Header";
import { Goal, useGoalStore } from "../storage/useGoalStore";
import { goalStats } from "../utils/goalMath";
import AddGoalSheet from "../components/AddGoalSheet";
import ContributeSheet from "../components/ContributeSheet";
import { alertError } from "../utils/alert";

// ── color tokens ─────────────────────────────────────────────────────────────
const colors = {
  background: "#0E0F11",
  cardBg: "#1A1B1F",
  cardBorder: "#2A2B30",
  primary: "#D4960A", // golden-amber
  accent: "#E8A045",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A8B91",
  textMuted: "#5A5B61",
  green: "#3DDC84",
  greenBg: "#1A3D28",
  statBg: "#24252B",
};

// ── helpers ──────────────────────────────────────────────────────────────────

const formatRupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const trimZero = (s: string) => s.replace(/\.0$/, "");
function formatCompact(n: number) {
  if (n >= 100000) return `₹${trimZero((n / 100000).toFixed(1))}L`;
  if (n >= 1000) return `₹${trimZero((n / 1000).toFixed(1))}k`;
  return `₹${Math.round(n)}`;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const daysLeftText = (days: number) =>
  days === 0 ? "Due today" : `${days} ${days === 1 ? "day" : "days"} left`;

// ── tiny sub-components ──────────────────────────────────────────────────────

function ActiveBadge() {
  return (
    <View style={badge.wrap}>
      <Text style={badge.diamond}>✦</Text>
      <Text style={badge.label}>ACTIVE GOAL</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  diamond: { color: colors.primary, fontSize: 10 },
  label: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});

function StatPill({ amount, label }: { amount: string; label: string }) {
  return (
    <View style={pill.wrap}>
      <Text style={pill.amount}>{amount}</Text>
      <Text style={pill.label}>{label}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.statBg,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  label: { color: colors.textSecondary, fontSize: 11 },
});

function DoneBadge() {
  return (
    <View style={done.wrap}>
      <Text style={done.text}>Done</Text>
    </View>
  );
}
const done = StyleSheet.create({
  wrap: {
    backgroundColor: colors.greenBg,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  text: { color: colors.green, fontSize: 11, fontWeight: "600" },
});

function GoalIcon({ emoji }: { emoji: string }) {
  return (
    <View style={icon.wrap}>
      <Text style={icon.emoji}>{emoji}</Text>
    </View>
  );
}
const icon = StyleSheet.create({
  wrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.statBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: { fontSize: 22 },
});

// ── main screen ──────────────────────────────────────────────────────────────

export default function Goals() {
  const goals = useGoalStore((s) => s.goals);
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const setActiveGoal = useGoalStore((s) => s.setActiveGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const [addVisible, setAddVisible] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);

  const activeGoal = goals.find((g) => g.id === activeGoalId);
  const otherGoals = goals.filter((g) => g.id !== activeGoalId);
  const inProgressCount = goals.filter((g) => !g.isCompleted).length;

  const confirmDelete = (g: Goal) =>
    Alert.alert("Delete goal?", `${g.emoji} ${g.name}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteGoal(g.id).catch(alertError("Couldn't delete goal")),
      },
    ]);

  const renderActiveGoal = (g: Goal) => {
    const s = goalStats(g);
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onLongPress={() => confirmDelete(g)}
        style={styles.activeCard}
      >
        <ActiveBadge />

        <Text style={styles.goalTitle}>
          {g.emoji} {g.name}
        </Text>
        <Text style={styles.goalDates}>Target {formatDate(g.targetDate)}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.savedAmount}>{formatRupees(g.savedAmount)}</Text>
          <Text style={styles.targetAmount}>
            of {formatRupees(g.targetAmount)}
          </Text>
        </View>

        <ProgressBar
          progress={s.progress}
          color={g.isCompleted ? colors.green : colors.primary}
          style={styles.progressBar}
        />

        <View style={[styles.row, styles.progressMeta]}>
          <Text style={styles.percentSaved}>{s.percent}% saved</Text>
          <Text style={styles.daysLeft}>
            {g.isCompleted ? "Goal achieved 🎉" : daysLeftText(s.daysLeft)}
          </Text>
        </View>

        {!g.isCompleted && (
          <>
            <View style={styles.pillRow}>
              <StatPill amount={formatRupees(s.perDay)} label="per day" />
              <StatPill amount={formatRupees(s.perWeek)} label="per week" />
              <StatPill amount={formatCompact(s.remaining)} label="to go" />
            </View>

            <TouchableOpacity
              style={styles.addMoneyBtn}
              activeOpacity={0.85}
              onPress={() => setContributeGoal(g)}
            >
              <Ionicons name="add" size={18} color="black" />
              <Text style={styles.addMoneyText}>Add money</Text>
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderSmallGoal = (g: Goal) => {
    const s = goalStats(g);
    const finished = g.isCompleted;
    const tint = finished ? colors.green : colors.primary;

    return (
      <TouchableOpacity
        key={g.id}
        style={styles.smallCard}
        activeOpacity={0.85}
        onPress={() =>
          setActiveGoal(g.id).catch(alertError("Couldn't switch goal"))
        }
        onLongPress={() => confirmDelete(g)}
      >
        <GoalIcon emoji={g.emoji} />

        <View style={{ flex: 1 }}>
          <View style={[styles.row, { marginBottom: 2 }]}>
            <Text style={styles.smallCardTitle} numberOfLines={1}>
              {g.name}
            </Text>
            <Text style={[styles.smallCardPercent, { color: tint }]}>
              {s.percent}%
            </Text>
          </View>

          {finished && <DoneBadge />}

          <Text style={styles.smallCardAmount}>
            {formatRupees(g.savedAmount)} of {formatRupees(g.targetAmount)}
          </Text>
          <ProgressBar
            progress={s.progress}
            color={tint}
            style={[styles.progressBar, { marginTop: 8 }]}
          />
        </View>

        <View style={styles.smallCardRight}>
          <Text
            style={[
              styles.smallCardRemaining,
              finished && { color: colors.green },
            ]}
          >
            {finished ? "Achieved" : `${formatCompact(s.remaining)} left`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* ── title row ── */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.myGoalsText}>My Goals</Text>
              <Text style={styles.activeCount}>
                {inProgressCount} in progress
              </Text>
            </View>
          </View>

          {/* ── active goal, or empty state ── */}
          {activeGoal ? (
            renderActiveGoal(activeGoal)
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyTitle}>No goals yet</Text>
              <Text style={styles.emptySub}>
                Set a savings target and Laksh will show how much to put aside
                each day.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                onPress={() => setAddVisible(true)}
              >
                <Text style={styles.addMoneyText}>Create your first goal</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── other goals ── */}
          {otherGoals.length > 0 && (
            <>
              <View style={[styles.row, styles.sectionRow]}>
                <Text style={styles.otherGoalsLabel}>Other goals</Text>
                <Text style={styles.hint}>
                  Tap to activate · Hold to delete
                </Text>
              </View>
              {otherGoals.map(renderSmallGoal)}
            </>
          )}
        </View>
      </ScrollView>

      <ContributeSheet
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
      />
      <AddGoalSheet visible={addVisible} onClose={() => setAddVisible(false)} />
    </SafeAreaView>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // keeps the last card clear of the tab bar
  },
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // title row
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  myGoalsText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  activeCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },

  // active card
  activeCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
    marginBottom: 20,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  goalDates: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  savedAmount: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
  },
  targetAmount: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cardBorder,
  },
  progressMeta: {
    marginTop: 8,
    marginBottom: 16,
  },
  percentSaved: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  daysLeft: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
  },
  addMoneyText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },

  // empty state
  emptyCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  // shared
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // other goals section
  sectionRow: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  otherGoalsLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
  },

  // small goal cards
  smallCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: "row",
    alignItems: "center",
  },
  smallCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  smallCardAmount: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  smallCardPercent: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  smallCardRight: {
    marginLeft: 12,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  smallCardRemaining: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
