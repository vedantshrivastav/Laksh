import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  colors,
  fontSize,
  fontFamily,
  spacing,
  radius,
} from "./constants/theme";
import { api, ApiError } from "./utils/api";
import { useAuthStore, type AuthUser } from "./storage/useAuthStore";

const OTP_LENGTH = 4;

// The backend's OTP is still mocked, so testers need to be told the code.
// Set this to false once a real SMS provider is added.
const SHOW_DEMO_HINT = true;

type VerifyResponse = {
  token: string;
  isNewUser: boolean;
  user: AuthUser;
};

export default function VerifyOTP() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const loginWithToken = useAuthStore((s) => s.loginWithToken);

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value) || loading) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    setInfo("");

    // Auto advance
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (value && index === OTP_LENGTH - 1) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (entered: string) => {
    if (loading) return;
    if (!phone) {
      setError("Phone number missing. Go back and try again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.post<VerifyResponse>(
        "/auth/verify-otp",
        { phone, otp: entered },
        { auth: false },
      );
      // Saving the session flips the layout's auth guard, which moves the user
      // to the tabs on its own. No manual navigation needed here.
      await loginWithToken(res.token, res.user);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Something went wrong. Try again.",
      );
      setOtp(["", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || loading) return;
    setError("");
    try {
      await api.post("/auth/send-otp", { phone }, { auth: false });
      setInfo("A new code has been sent.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't resend the code.");
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Top */}
        <View style={styles.top}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 4-digit code sent to +91 {phone}
          </Text>
          {SHOW_DEMO_HINT && <Text style={styles.hint}>Demo code: 1234</Text>}
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(val) => handleChange(val.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              editable={!loading}
            />
          ))}
        </View>

        {/* Error / info */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, (!isComplete || loading) && styles.btnDisabled]}
          onPress={() => verifyOTP(otp.join(""))}
          disabled={!isComplete || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.btnText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity onPress={handleResend} disabled={loading}>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.xxxl,
  },
  backText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  top: {
    marginBottom: spacing.xxxl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hint: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
    justifyContent: "center",
  },
  otpBox: {
    width: 64,
    height: 64,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.surfaceBorder,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  info: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  btnDisabled: {
    backgroundColor: colors.surfaceBorder,
  },
  btnText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,
    color: colors.background,
  },
  resend: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.accent,
    textAlign: "center",
  },
});
