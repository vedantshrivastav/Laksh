import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from "../constants/theme";

const stats = [
  {
    label: "Monthly spend",
    value: "₹24.8k",
    delta: "+12%",
    tone: "amber",
    icon: "wallet-outline",
  },
  {
    label: "Goals saved",
    value: "3",
    delta: "On track",
    tone: "green",
    icon: "flag-outline",
  },
  {
    label: "Streak",
    value: "18 days",
    delta: "+4",
    tone: "blue",
    icon: "flame-outline",
  },
] as const;

const accountActions = [
  {
    label: "Edit profile",
    hint: "Update your details",
    icon: "person-circle-outline",
    tint: "#2C3150",
  },
  {
    label: "Payment methods",
    hint: "Cards & wallets",
    icon: "card-outline",
    tint: "#2A2F1D",
  },
  {
    label: "Notifications",
    hint: "Alerts & reminders",
    icon: "notifications-outline",
    tint: "#2F2430",
  },
  {
    label: "Security",
    hint: "Password & login",
    icon: "shield-checkmark-outline",
    tint: "#1D2F2A",
  },
  {
    label: "Help & support",
    hint: "Contact the team",
    icon: "help-circle-outline",
    tint: "#2D2A2A",
  },
] as const;

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
            <Ionicons
              name="create-outline"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>VS</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>Vedant shrivastav</Text>
            <Text style={styles.email}>vedantshrivastav@laksh.app</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Premium</Text>
              </View>
              <View style={[styles.badge, styles.badgeAlt]}>
                <Text style={styles.badgeText}>AI Coach</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View
              key={item.label}
              style={[
                styles.statCard,
                item.tone === "amber" && styles.amberCard,
                item.tone === "green" && styles.greenCard,
                item.tone === "blue" && styles.blueCard,
              ]}
            >
              <View style={styles.statTop}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors.textPrimary}
                />
                <Text style={styles.statDelta}>{item.delta}</Text>
              </View>

              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Smart Summary</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Monthly budget</Text>
              <Text style={styles.summaryValue}>₹42,500</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Saved</Text>
              <Text style={styles.summaryValue}>₹12,400</Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Budget health</Text>
              <Text style={styles.progressPercent}>74%</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressMeta}>
              You still have ₹11,100 left this cycle.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>

          {accountActions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.listItem}
              activeOpacity={0.8}
            >
              <View
                style={[styles.listIconWrap, { backgroundColor: item.tint }]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={colors.textPrimary}
                />
              </View>

              <View style={styles.listTextWrap}>
                <Text style={styles.listLabel}>{item.label}</Text>
                <Text style={styles.listHint}>{item.hint}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#F59E9E" />
          <Text style={styles.signOutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2A2418",
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.accent,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  badgeAlt: {
    backgroundColor: "#1C2E2B",
    borderColor: "#4CAF82",
  },
  badgeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 120,
  },
  amberCard: {
    backgroundColor: "#1E1C1A",
  },
  greenCard: {
    backgroundColor: "#162C28",
  },
  blueCard: {
    backgroundColor: "#161D2B",
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  statDelta: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#171B21",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
  },
  summaryLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  progressWrap: {
    gap: spacing.sm,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressPercent: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  progressBar: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: "#2A2D35",
    overflow: "hidden",
  },
  progressFill: {
    width: "74%",
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  progressMeta: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  listIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  listTextWrap: {
    flex: 1,
  },
  listLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  listHint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#1F1717",
    borderWidth: 1,
    borderColor: "#3A2323",
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  signOutText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: "#F59E9E",
  },
});
