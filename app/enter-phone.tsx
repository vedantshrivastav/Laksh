import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  colors,
  fontSize,
  fontFamily,
  spacing,
  radius,
} from "./constants/theme";
import { api, ApiError } from "./utils/api";

export default function EnterPhone() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  const isValid = phone.length === 10 && /^[6-9]/.test(phone);

  const handleSendOTP = async () => {
    if (!isValid || loading) return;

    setLoading(true);
    setError("");
    // A free-tier server can take a while to wake up on the first request
    const slowTimer = setTimeout(() => setSlow(true), 5000);

    try {
      await api.post("/auth/send-otp", { phone }, { auth: false });
      router.push({ pathname: "/verify-otp", params: { phone } });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Top */}
        <View style={styles.top}>
          <Text style={styles.title}>Enter your{"\n"}phone number</Text>
          <Text style={styles.subtitle}>
            We'll send a verification code to confirm it's you
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="00000 00000"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setPhone(t.replace(/\D/g, ""));
              setError("");
            }}
            editable={!loading}
          />
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, (!isValid || loading) && styles.btnDisabled]}
          onPress={handleSendOTP}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.btnText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        {slow && (
          <Text style={styles.slowNote}>
            Waking up the server, this can take up to a minute the first time.
          </Text>
        )}

        <Text style={styles.disclaimer}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  top: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  countryCode: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
  },
  countryCodeText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.medium,
    color: colors.textPrimary,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    letterSpacing: 2,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  btnDisabled: {
    backgroundColor: colors.surfaceBorder,
  },
  btnText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.background,
  },
  slowNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
