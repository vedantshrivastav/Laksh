import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressBar } from "react-native-paper";
import Header from "../common/Header";

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

// ── Day circle ───────────────────────────────────────────────────────────────
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
export default function Rewards() {
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
              <Text style={styles.streakCount}>12 days</Text>
              {/* <Text style={styles.streakDays}>days</Text> */}
            </View>
            <View style={styles.dayRow}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <DayCircle key={i} letter={d} active={i < 5} />
              ))}
            </View>
          </View>

          {/* ── AI tier ── */}
          <Text style={styles.sectionLabel}>AI tier</Text>
          <View style={styles.tierRow}>
            <TierCard icon="🤖" label="Assistant" sub="Week 1" />
            <TierCard icon="📊" label="Analyst" sub="Week 2" active />
            <TierCard icon="💼" label="CFO" sub="Month 1" />
            <TierCard icon="🔮" label="Oracle" sub="3 months" />
          </View>

          {/* ── your rewards ── */}
          <View style={[styles.row, { marginTop: 24, marginBottom: 12 }]}>
            <Text style={styles.sectionLabel}>Your rewards</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>

          {/* Weekly Money Story */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <RewardIcon letter="W" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text style={styles.rewardTitle}>Weekly Money Story</Text>
                  <Badge label="Ready" variant="ready" />
                </View>
                <Text style={styles.rewardDesc}>
                  Your week in money — Spotify Wrapped style
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerText}>
                Available every Sunday · Tap to view
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
                  <Badge label="18 days" variant="days" />
                </View>
                <Text style={styles.rewardDesc}>30 day streak achievement</Text>
              </View>
            </View>
            {/* progress */}
            <ProgressBar
              progress={0.4}
              color={colors.primary}
              style={styles.progressBar}
            />
            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={styles.footerText}>12 of 30 days</Text>
              <Text
                style={[
                  styles.footerText,
                  { color: colors.primary, fontWeight: "700" },
                ]}
              >
                40%
              </Text>
            </View>
          </View>

          {/* Spending Personality */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardTop}>
              <RewardIcon letter="S" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text style={styles.rewardTitle}>
                    Spending{"\n"}Personality
                  </Text>
                  <Badge label="Claimed" variant="claimed" />
                </View>
                <Text style={styles.rewardDesc}>
                  AI analysis of your money habits
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerDot}>✓</Text>
              <Text style={styles.footerText}>
                Unlocked at 7 day streak · Tap to revisit
              </Text>
            </View>
          </View>

          {/* Financial Ninja Badge — locked */}
          <View style={[styles.rewardCard, styles.lockedCard]}>
            <View style={styles.rewardTop}>
              <RewardIcon letter="F" />
              <View style={{ flex: 1 }}>
                <View style={[styles.row, { marginBottom: 4 }]}>
                  <Text
                    style={[
                      styles.rewardTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Financial Ninja{"\n"}Badge
                  </Text>
                  <Badge label="🔒 Locked" variant="locked" />
                </View>
                <Text style={styles.rewardDesc}>
                  90 day streak — the ultimate achievement
                </Text>
              </View>
            </View>
            <View style={styles.rewardFooter}>
              <Text style={styles.footerText}>
                Maintain a 90 day streak to unlock
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
  streakDays: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: -4,
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
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 18,
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
