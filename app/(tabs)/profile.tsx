import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from "../constants/theme";
import { useAuthStore } from "../storage/useAuthStore";
import { useExpenseStore } from "../storage/useExpenseStore";
import { useGoalStore } from "../storage/useGoalStore";
import { useSettingsStore } from "../storage/useSettingsStore";
import { useCommitmentStore } from "../storage/useCommitmentStore";
import { useNotificationStore } from "../storage/useNotificationStore";
import { getCurrentStreak, getLongestStreak, getTier } from "../utils/streak";
import CommitmentSheet from "../components/CommitmentSheet";
import ImportStatementSheet from "../components/ImportStatementSheet";
import Header from "../common/Header";

// ── Helpers ──────────────────────────────────────────────────────────────────

const trimZero = (s: string) => s.replace(/\.0$/, "");

function formatCompact(n: number) {
  if (n >= 100000) return `₹${trimZero((n / 100000).toFixed(1))}L`;
  if (n >= 1000) return `₹${trimZero((n / 1000).toFixed(1))}k`;
  return `₹${Math.round(n)}`;
}

function formatRupees(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function formatPhone(phone?: string | null) {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) {
    return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  }
  return phone;
}

function getInitials(name?: string | null) {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type Row = {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  onPress: () => void;
};

// ── Small bottom sheet used for editing the name and the budget ─────────────

function EditSheet({
  visible,
  title,
  initialValue,
  placeholder,
  keyboardType,
  prefix,
  maxLength,
  validate,
  onSave,
  onClose,
}: {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
  prefix?: string;
  maxLength?: number;
  validate: (value: string) => string | null;
  onSave: (value: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // start fresh each time the sheet opens
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setError("");
    }
  }, [visible, initialValue]);

  const handleSave = async () => {
    const message = validate(value);
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    try {
      await onSave(value);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheet}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(t) => {
              setValue(
                keyboardType === "number-pad" ? t.replace(/\D/g, "") : t,
              );
              setError("");
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={keyboardType}
            maxLength={maxLength}
            autoFocus
            editable={!saving}
          />
        </View>

        {error ? <Text style={styles.sheetError}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.sheetSave, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.sheetSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateName = useAuthStore((s) => s.updateName);

  const expenses = useExpenseStore((s) => s.expenses);
  const goals = useGoalStore((s) => s.goals);
  const commitments = useCommitmentStore((s) => s.commitments);
  const unread = useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
  const monthlyBudget = useSettingsStore((s) => s.monthlyBudget);
  const setMonthlyBudget = useSettingsStore((s) => s.setMonthlyBudget);

  const [sheet, setSheet] = useState<"name" | "budget" | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // ── Derived numbers ──
  const now = new Date();
  const monthSum = (offset: number) => {
    const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === ref.getFullYear() &&
          d.getMonth() === ref.getMonth()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };
  const monthTotal = monthSum(0);
  const prevMonthTotal = monthSum(-1);
  const monthDelta =
    prevMonthTotal > 0
      ? Math.round(((monthTotal - prevMonthTotal) / prevMonthTotal) * 100)
      : null;

  const streak = getCurrentStreak(expenses);
  const longest = getLongestStreak(expenses);
  const { tier } = getTier(streak);

  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

  const usedPercent =
    monthlyBudget > 0 ? Math.round((monthTotal / monthlyBudget) * 100) : 0;
  const barPercent = Math.min(usedPercent, 100);
  const budgetLeft = monthlyBudget - monthTotal;

  const stats = [
    {
      label: "Monthly spend",
      value: formatCompact(monthTotal),
      delta:
        monthDelta === null
          ? "New"
          : `${monthDelta >= 0 ? "+" : ""}${monthDelta}%`,
      tone: "amber",
      icon: "wallet-outline",
    },
    {
      label: "Goals",
      value: String(goals.length),
      delta:
        goals.length === 0
          ? "None yet"
          : completedGoals > 0
            ? `${completedGoals} done`
            : "In progress",
      tone: "green",
      icon: "flag-outline",
    },
    {
      label: "Streak",
      value: `${streak} ${streak === 1 ? "day" : "days"}`,
      delta: `Best ${longest}`,
      tone: "blue",
      icon: "flame-outline",
    },
  ] as const;

  const rows: Row[] = [
    {
      label: "Edit profile",
      hint: user?.name ? "Change your display name" : "Add your name",
      icon: "person-circle-outline",
      tint: "#2C3150",
      onPress: () => setSheet("name"),
    },
    {
      label: "Monthly budget",
      hint: `${formatRupees(monthlyBudget)} per month`,
      icon: "wallet-outline",
      tint: "#2A2F1D",
      onPress: () => setSheet("budget"),
    },
    {
      label: "Spending rules",
      hint: commitments.length
        ? `${commitments.length} active`
        : "Set limits Laksh will enforce",
      icon: "shield-checkmark-outline",
      tint: "#1D2F2A",
      onPress: () => setRulesOpen(true),
    },
    {
      label: "Notifications",
      hint: unread ? `${unread} unread` : "All caught up",
      icon: "notifications-outline",
      tint: "#2F2430",
      onPress: () => router.push("/notifications"),
    },
    {
      label: "Import bank statement",
      hint: "Add past transactions from a CSV",
      icon: "document-text-outline",
      tint: "#2D2A2A",
      onPress: () => setImportOpen(true),
    },
  ];

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out?",
      "You'll need to verify your phone number to log back in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            logout(); // the layout's auth guard sends the user to the login screen
          },
        },
      ],
    );
  };

  const initials = getInitials(user?.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          {/* <View style={{ width: 38 }} /> */}

          <Text style={styles.headerTitle}>Profile</Text>

          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => setSheet("name")}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            {initials ? (
              <Text style={styles.avatarText}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={30} color={colors.accent} />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name || "Add your name"}</Text>
            <Text style={styles.phone}>
              {formatPhone(user?.phone) || "Phone unavailable"}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tier} tier</Text>
              </View>
              <View style={[styles.badge, styles.badgeAlt]}>
                <Text style={styles.badgeText}>
                  {streak > 0 ? `${streak}-day streak` : "New member"}
                </Text>
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
            <TouchableOpacity
              style={styles.summaryBox}
              activeOpacity={0.8}
              onPress={() => setSheet("budget")}
            >
              <Text style={styles.summaryLabel}>Monthly budget</Text>
              <Text style={styles.summaryValue}>
                {formatRupees(monthlyBudget)}
              </Text>
            </TouchableOpacity>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Saved in goals</Text>
              <Text style={styles.summaryValue}>
                {formatRupees(totalSaved)}
              </Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Budget used</Text>
              <Text
                style={[
                  styles.progressPercent,
                  usedPercent >= 90 && { color: colors.danger },
                ]}
              >
                {usedPercent}%
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${barPercent}%` as `${number}%` },
                  usedPercent >= 90 && { backgroundColor: colors.danger },
                ]}
              />
            </View>

            <Text style={styles.progressMeta}>
              {monthlyBudget <= 0
                ? "Set a monthly budget to track it here."
                : budgetLeft >= 0
                  ? `You still have ${formatRupees(budgetLeft)} left this month.`
                  : `You're ${formatRupees(Math.abs(budgetLeft))} over budget this month.`}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>

          {rows.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.listItem,
                index === rows.length - 1 && { borderBottomWidth: 0 },
              ]}
              activeOpacity={0.8}
              onPress={item.onPress}
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

        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#F59E9E" />
          <Text style={styles.signOutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Laksh v{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScrollView>

      {/* Edit name */}
      <EditSheet
        visible={sheet === "name"}
        title="Your name"
        initialValue={user?.name ?? ""}
        placeholder="e.g. Vedant Shrivastav"
        maxLength={40}
        validate={(v) => (v.trim().length < 1 ? "Enter your name" : null)}
        onSave={(v) => updateName(v.trim())}
        onClose={() => setSheet(null)}
      />

      {/* Edit monthly budget */}
      <EditSheet
        visible={sheet === "budget"}
        title="Monthly budget"
        initialValue={monthlyBudget > 0 ? String(monthlyBudget) : ""}
        placeholder="15000"
        keyboardType="number-pad"
        prefix="₹"
        maxLength={8}
        validate={(v) => {
          const n = Number(v);
          if (!n || n <= 0) return "Enter an amount greater than 0";
          if (n > 10000000) return "That's a bit too high";
          return null;
        }}
        onSave={(v) => setMonthlyBudget(Number(v))}
        onClose={() => setSheet(null)}
      />

      <CommitmentSheet
        visible={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
      <ImportStatementSheet
        visible={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
  phone: {
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
  version: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
  },

  // Edit sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xxl,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: spacing.xl,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  inputPrefix: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  sheetError: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  sheetSave: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  sheetSaveText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.background,
  },
});
