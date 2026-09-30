import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressBar } from "react-native-paper";
import Header from "../common/Header";
import { useExpenseStore } from "../storage/useExpenseStore";
import {
  getCurrentStreak,
  getTier,
  getLastSevenDays,
  getRewardStatus,
  type Tier,
} from "../utils/streak";

const colors = {
  background: "#0E0F11",
  cardBg: "#1A1B1F",
  cardBorder: "#2A2B30",
  primary: "#D4960A",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A8B91",
  textMuted: "#5A5B61",
  green: "#3DDC84",
  greenBg: "#1A3D28",
  statBg: "#24252B",
  streakActive: "#7A5C1E",
  streakInactive: "#2A2B30",
};

function DayCircle({ letter, active }: { letter: string; active: boolean }) {
  return (
    <View
      style={[daycircle.wrap, active ? daycircle.active : daycircle.inactive]}
    >
      <Text style={[daycircle.letter, !active && { color: colors.textMuted }]}>
        {letter}
      </Text>
    </View>
  );
}
const daycircle = StyleSheet.create({
  wrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 3,
  },
  active: { backgroundColor: colors.streakActive },
  inactive: { backgroundColor: colors.streakInactive },
  letter: { color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
});

// ── AI Tier card ─────────────────────────────────────────────────────────────
function TierCard({
  icon,
  label,
  sub,
  active,
}: {
  icon: string;
  label: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <View style={[tier.wrap, active && tier.activeWrap]}>
      <Text style={tier.icon}>{icon}</Text>
      <Text style={[tier.label, active && tier.activeLabel]}>{label}</Text>
      <Text style={tier.sub}>{sub}</Text>
      {active && <View style={tier.dot} />}
    </View>
  );
}
const tier = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.statBg,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeWrap: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#1E1A12",
  },
  icon: { fontSize: 18, marginBottom: 4 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  activeLabel: { color: colors.textPrimary },
  sub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
});

// ── Reward icon box ───────────────────────────────────────────────────────────
function RewardIcon({ letter }: { letter: string }) {
  return (
    <View style={ri.wrap}>
      <Text style={ri.letter}>{letter}</Text>
    </View>
  );
}
const ri = StyleSheet.create({
  wrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.statBg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  letter: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
});

// ── Status badge ─────────────────────────────────────────────────────────────
function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "ready" | "claimed" | "locked" | "days";
}) {
  const bg =
    variant === "ready"
      ? "#3D2E0E"
      : variant === "claimed"
        ? colors.greenBg
        : "#24252B";
  const fg =
    variant === "ready"
      ? colors.primary
      : variant === "claimed"
        ? colors.green
        : colors.textSecondary;
  return (
    <View style={[badgeSt.wrap, { backgroundColor: bg }]}>
      <Text style={[badgeSt.text, { color: fg }]}>{label}</Text>
    </View>
  );
}
const badgeSt = StyleSheet.create({
  wrap: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "600" },
});

// ── main screen ──────────────────────────────────────────────────────────────
const TIERS: { key: Tier; icon: string; sub: string }[] = [
  { key: "Assistant", icon: "🤖", sub: "0-6 days" },
  { key: "Analyst", icon: "📊", sub: "7-29 days" },
  { key: "CFO", icon: "💼", sub: "30-89 days" },
  { key: "Oracle", icon: "🔮", sub: "90+ days" },
];

export default function Rewards() {
  const expenses = useExpenseStore((s) => s.expenses);

  const streak = getCurrentStreak(expenses);
  const { tier: currentTier } = getTier(streak);
  const days = getLastSevenDays(expenses);
  const rewards = getRewardStatus(expenses, streak);

  const moneyMindfulDaysLeft = Math.max(30 - streak, 0);
  const ninjaDaysLeft = Math.max(90 - streak, 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* ── page title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Rewards</Text>
            <Text style={styles.subtitle}>Keep your streak to unlock more</Text>
          </View>

          {/* ── streak card ── */}
          <View style={styles.card}>
            <Text style={styles.streakLabel}>Current{"\n"}streak</Text>
            <View style={styles.streakRight}>
              <Text style={styles.streakCount}>
                {streak} {streak === 1 ? "day" : "days"}
              </Text>
            </View>
            <View style={styles.dayRow}>
              {days.map((d, i) => (
                <DayCircle key={i} letter={d.letter} active={d.active} />
              ))}
            </View>
          </View>

          {/* ── AI tier ── */}
          <Text style={styles.sectionLabel}>AI tier</Text>
          <View style={styles.tierRow}>
            {TIERS.map((t) => (
              <TierCard
                key={t.key}
                icon={t.icon}
                label={t.key}
                sub={t.sub}
                active={t.key === currentTier}
              />
            ))}
          </View>

          {/* ── your rewards ── */}
          <View style={[styles.row, { marginTop: 24, marginBottom: 12 }]}>
            <Text style={styles.sectionLabel}>Your rewards</Text>
          </View>

          {/* Weekly Money Story */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <RewardIcon letter="W" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text style={styles.rewardTitle}>Weekly Money Story</Text>
                  <Badge
                    label={rewards.weeklyStoryReady ? "Ready" : "Not yet"}
                    variant={rewards.weeklyStoryReady ? "ready" : "locked"}
                  />
                </View>
                <Text style={styles.rewardDesc}>
                  Your week in money — Spotify Wrapped style
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerText}>
                {rewards.weeklyStoryReady
                  ? "Tap to view this week's story"
                  : "Log an expense this week to unlock"}
              </Text>
            </View>
          </View>

          {/* Money Mindful Badge */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <RewardIcon letter="M" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text style={styles.rewardTitle}>
                    Money Mindful{"\n"}Badge
                  </Text>
                  <Badge
                    label={
                      rewards.moneyMindfulUnlocked
                        ? "Claimed"
                        : `${moneyMindfulDaysLeft} days`
                    }
                    variant={rewards.moneyMindfulUnlocked ? "claimed" : "days"}
                  />
                </View>
                <Text style={styles.rewardDesc}>30 day streak achievement</Text>
              </View>
            </View>
            <ProgressBar
              progress={rewards.moneyMindfulProgress}
              color={colors.primary}
              style={styles.progressBar}
            />
            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={styles.footerText}>
                {Math.min(streak, 30)} of 30 days
              </Text>
              <Text
                style={[
                  styles.footerText,
                  { color: colors.primary, fontWeight: "700" },
                ]}
              >
                {Math.round(rewards.moneyMindfulProgress * 100)}%
              </Text>
            </View>
          </View>

          {/* Spending Personality */}
          <View
            style={[
              styles.rewardCard,
              !rewards.spendingPersonalityUnlocked && styles.lockedCard,
            ]}
          >
            <View style={styles.rewardTop}>
              <RewardIcon letter="S" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text
                    style={[
                      styles.rewardTitle,
                      !rewards.spendingPersonalityUnlocked && {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Spending{"\n"}Personality
                  </Text>
                  <Badge
                    label={
                      rewards.spendingPersonalityUnlocked
                        ? "Unlocked"
                        : "🔒 Locked"
                    }
                    variant={
                      rewards.spendingPersonalityUnlocked ? "claimed" : "locked"
                    }
                  />
                </View>
                <Text style={styles.rewardDesc}>
                  AI analysis of your money habits
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerDot}>
                {rewards.spendingPersonalityUnlocked ? "✓" : ""}
              </Text>
              <Text style={styles.footerText}>
                {rewards.spendingPersonalityUnlocked
                  ? "Unlocked at 7 day streak · Tap to view"
                  : `Reach a 7 day streak to unlock (${streak}/7)`}
              </Text>
            </View>
          </View>

          {/* Financial Ninja Badge */}
          <View
            style={[
              styles.rewardCard,
              !rewards.financialNinjaUnlocked && styles.lockedCard,
            ]}
          >
            <View style={styles.rewardTop}>
              <RewardIcon letter="F" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text
                    style={[
                      styles.rewardTitle,
                      !rewards.financialNinjaUnlocked && {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    Financial Ninja{"\n"}Badge
                  </Text>
                  <Badge
                    label={
                      rewards.financialNinjaUnlocked ? "Unlocked" : "🔒 Locked"
                    }
                    variant={
                      rewards.financialNinjaUnlocked ? "claimed" : "locked"
                    }
                  />
                </View>
                <Text style={styles.rewardDesc}>
                  90 day streak — the ultimate achievement
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerText}>
                {rewards.financialNinjaUnlocked
                  ? "Achieved! You're a Financial Ninja."
                  : `Maintain a 90 day streak to unlock (${ninjaDaysLeft} to go)`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },

  titleBlock: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // streak card
  card: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  streakLabel: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  streakRight: {
    marginLeft: "auto",
    alignItems: "center",
  },
  streakCount: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
  },
  dayRow: { flexDirection: "row", alignItems: "center" },

  // tier
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  tierRow: {
    flexDirection: "row",
    marginHorizontal: 14,
  },

  // shared
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // reward cards
  rewardCard: {
    backgroundColor: colors.cardBg,
    marginHorizontal: 18,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  lockedCard: { opacity: 0.6 },
  rewardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  rewardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  rewardDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  rewardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerDot: { color: colors.textMuted, fontSize: 12 },
  footerText: { color: colors.textMuted, fontSize: 12 },

  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2A2B30",
    marginTop: 4,
  },
});
