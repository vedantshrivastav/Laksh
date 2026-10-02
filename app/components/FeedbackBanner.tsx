import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { FeedbackTone } from "../utils/expenseFeedback";

const TONE_COLORS: Record<
  FeedbackTone,
  { bg: string; border: string; text: string }
> = {
  warning: { bg: "#3D2E0E", border: "#D4960A", text: "#FFBE71" },
  info: { bg: "#1E2025", border: "#524437", text: "#E2E2E9" },
  success: { bg: "#1A3D28", border: "#3DDC84", text: "#3DDC84" },
};

export default function FeedbackBanner({
  message,
  tone,
  onDismiss,
  duration = 2600,
}: {
  message: string;
  tone: FeedbackTone;
  onDismiss: () => void;
  duration?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const colors = TONE_COLORS[tone];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: colors.bg, borderColor: colors.border, opacity },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});
