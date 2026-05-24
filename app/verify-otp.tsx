import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  colors,
  fontSize,
  fontFamily,
  spacing,
  radius,
} from "./constants/theme";

const MOCK_OTP = "1234";
const OTP_LENGTH = 4;

export default function VerifyOTP() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto advance
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto verify when all filled
    if (value && index === OTP_LENGTH - 1) {
      const entered = [...newOtp.slice(0, 3), value].join("");
      verifyOTP(entered);
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

  const verifyOTP = (entered: string) => {
    if (entered === MOCK_OTP) {
      router.replace("/(tabs)");
    } else {
      setError("Incorrect OTP. Use 1234 for demo.");
      setOtp(["", "", "", ""]);
      inputs.current[0]?.focus();
    }
  };

  const handleVerify = () => {
    verifyOTP(otp.join(""));
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
            Enter the 4-digit code sent to your phone
          </Text>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(val) => handleChange(val.slice(-1), index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, !isComplete && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Verify</Text>
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity>
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
