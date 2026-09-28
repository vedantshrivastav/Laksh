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
import Header from "../common/Header";
import { Goal, useGoalStore } from "../storage/useGoalStore";
import { goalStats } from "../utils/goalMath";
import { useState } from "react";
import AddGoalSheet from "../components/AddGoalSheet";
import ContributeSheet from "../components/ContributeSheet";
import { Ionicons } from "@expo/vector-icons";

// ── color tokens (inline so you can swap with your constants/theme import) ──
const colors = {
  background: "#0E0F11",
  cardBg: "#1A1B1F",
  cardBorder: "#2A2B30",
  primary: "#D4960A", // golden-amber
  primaryDim: "#3D2E0E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A8B91",
  textMuted: "#5A5B61",
  green: "#3DDC84",
  statBg: "#24252B",
};

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
    backgroundColor: "#1A3D28",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  text: { color: colors.green, fontSize: 11, fontWeight: "600" },
});

function GoalIcon({ letter }: { letter: string }) {
  return (
    <View style={icon.wrap}>
      <Text style={icon.letter}>{letter}</Text>
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
  letter: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
});

// ── main screen ──────────────────────────────────────────────────────────────

export default function Goals() {
  const goals = useGoalStore((s) => s.goals);
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const setActiveGoal = useGoalStore((s) => s.setActiveGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const activeGoal = goals.find((g) => g.id === activeGoalId);
  const otherGoals = goals.filter((g) => g.id !== activeGoalId);
  const [addVisible, setAddVisible] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* ── header ── */}
          <View style={styles.topRow}>
            <Text style={styles.myGoalsText}>My Goals</Text>
            <Text style={styles.activeCount}>2 active</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 18,
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              Goals
            </Text>
            <TouchableOpacity
              onPress={() => setAddVisible(true)}
              style={{
                backgroundColor: "#E8A045",
                borderRadius: 20,
                padding: 6,
              }}
            >
              <Ionicons name="add" size={22} color="black" />
            </TouchableOpacity>
          </View>

          {/* ── active goal card ── */}
          {activeGoal ? (
            (() => {
              const s = goalStats(activeGoal);
              return (
                <View style={styles.card}>
                  <Text style={{ color: "white" }}>
                    {activeGoal.emoji} {activeGoal.name}
                  </Text>
                  <Text style={{ color: "#FFBE71" }}>
                    ₹{activeGoal.savedAmount.toLocaleString("en-IN")} / ₹
                    {activeGoal.targetAmount.toLocaleString("en-IN")}
                  </Text>
                  <ProgressBar progress={s.progress} color="#E8A045" />
                  <Text style={{ color: "#D6C3B1" }}>
                    {s.percent}% · {s.daysLeft} days left
                  </Text>
                  <Text style={{ color: "#D6C3B1" }}>
                    Save ₹{s.perDay}/day or ₹{s.perWeek}/week
                  </Text>
                  <TouchableOpacity
                    onPress={() => setContributeGoal(activeGoal)}
                  >
                    <Text style={{ color: "#E8A045" }}>Add money</Text>
                  </TouchableOpacity>
                </View>
              );
            })()
          ) : (
            <Text style={{ color: "#D6C3B1" }}>
              No goals yet. Tap + to create one.
            </Text>
          )}

          {/* ── other goals header ── */}
          {otherGoals.map((g) => {
            const s = goalStats(g);
            return (
              <TouchableOpacity
                key={g.id}
                style={styles.card}
                onPress={() => setActiveGoal(g.id)}
                onLongPress={() =>
                  Alert.alert("Delete goal?", g.name, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteGoal(g.id),
                    },
                  ])
                }
              >
                <Text style={{ color: "white" }}>
                  {g.emoji} {g.name}
                </Text>
                <ProgressBar progress={s.progress} color="#E8A045" />
                <Text style={{ color: "#D6C3B1" }}>{s.percent}%</Text>
              </TouchableOpacity>
            );
          })}

          {/* ── MacBook Pro card ── */}
          <View style={styles.smallCard}>
            <GoalIcon letter="M" />
            <View style={{ flex: 1 }}>
              <View style={[styles.row, { marginBottom: 2 }]}>
                <Text style={styles.smallCardTitle}>MacBook Pro</Text>
                <Text style={styles.smallCardPercent}>40%</Text>
              </View>
              <Text style={styles.smallCardAmount}>₹48,000 of ₹1,20,000</Text>
              <ProgressBar
                progress={0.4}
                color={colors.primary}
                style={[styles.progressBar, { marginTop: 8 }]}
              />
            </View>
            <View style={styles.smallCardRight}>
              <Text style={styles.smallCardRemaining}>₹72k left</Text>
            </View>
          </View>

          {/* ── Emergency Fund card ── */}
          <View style={styles.smallCard}>
            <GoalIcon letter="E" />
            <View style={{ flex: 1 }}>
              <View style={[styles.row, { marginBottom: 2 }]}>
                <Text style={styles.smallCardTitle}>Emergency Fund</Text>
                <Text
                  style={[styles.smallCardPercent, { color: colors.green }]}
                >
                  100%
                </Text>
              </View>
              <DoneBadge />
              <Text style={styles.smallCardAmount}>₹50,000 of ₹50,000</Text>
              <ProgressBar
                progress={1.0}
                color={colors.green}
                style={[styles.progressBar, { marginTop: 8 }]}
              />
            </View>
            <View style={styles.smallCardRight}>
              <Text
                style={[styles.smallCardRemaining, { color: colors.green }]}
              >
                Achieved
              </Text>
            </View>
          </View>
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
  },
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // header
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    marginTop: 8,
  },
  myGoalsText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  activeCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // active card
  card: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
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
    marginBottom: 2,
  },
  savedAmount: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
  },
  targetAmount: {
    color: colors.textSecondary,
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2A2B30",
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
  },

  // shared
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // other goals section
  otherGoalsLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
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
    color: colors.primary,
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
    marginTop: 4,
  },
});
