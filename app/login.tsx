import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  fontFamily,
  fontSize,
  spacing,
  radius,
} from "./constants/theme";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top badge */}
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>✦ Powered by AI</Text>
        </View>

        {/* Center — Logo + tagline */}
        <View style={styles.center}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>₹</Text>
          </View>
          <Text style={styles.appName}>Laksh</Text>
          <Text style={styles.tagline}>
            Spend smart today.{"\n"}Achieve your goal tomorrow.
          </Text>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Smart Spending AI Assistant</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Bottom — CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.otpButton}
            onPress={() => router.push("/enter-phone")}
            activeOpacity={0.85}
          >
            <Text style={styles.otpButtonText}>Continue with Phone</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing you agree to our{" "}
            <Text style={styles.disclaimerLink}>Terms & Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    justifyContent: "space-between",
  },

  // Top badge
  topBadge: {
    alignSelf: "center",
    backgroundColor: colors.accentMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 0.5,
    borderColor: colors.accent,
  },
  topBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  center: {
    alignItems: "center",
    gap: spacing.lg,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  logoMarkText: {
    fontSize: 32,
    color: colors.accent,
    fontFamily: fontFamily.bold,
  },
  appName: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  // Bottom
  bottom: {
    gap: spacing.lg,
  },
  otpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  otpButtonText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.background,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  disclaimerLink: {
    color: colors.accent,
    fontFamily: fontFamily.medium,
  },
});
