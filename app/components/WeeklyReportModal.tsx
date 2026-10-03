import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontFamily, radius } from "../constants/theme";
import type { WeeklyReport } from "../utils/weeklyReport";

export default function WeeklyReportModal({
  report,
  onClose,
}: {
  report: WeeklyReport | null;
  onClose: () => void;
}) {
  if (!report) return null;

  const isUp = report.changePercent !== null && report.changePercent >= 0;

  return (
    <Modal visible={!!report} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.badge}>✦ YOUR WEEK IN MONEY</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalAmount}>
          ₹{Math.round(report.total).toLocaleString("en-IN")}
        </Text>
        <Text style={styles.totalLabel}>spent last week</Text>

        {report.changePercent !== null && (
          <View
            style={[
              styles.changePill,
              { borderColor: isUp ? "#EF4444" : "#3DDC84" },
            ]}
          >
            <Text
              style={{
                color: isUp ? "#EF4444" : "#3DDC84",
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {isUp ? "↑" : "↓"} {Math.abs(report.changePercent)}% vs the week
              before
            </Text>
          </View>
        )}

        {report.topCategoryLabel && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Top category</Text>
            <Text style={styles.statValue}>
              {report.topCategoryLabel} · {report.topCategoryPercent}%
            </Text>
          </View>
        )}

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active days</Text>
          <Text style={styles.statValue}>{report.dayCount} / 7</Text>
        </View>

        <Text style={styles.message}>{report.message}</Text>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  card: {
    position: "absolute",
    top: "20%",
    left: 20,
    right: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#524437",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  badge: {
    color: "#E8A045",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 42,
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 14,
  },
  changePill: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: radius.full ?? 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#2A2B30",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  message: {
    color: "#D6C3B1",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#E8A045",
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  closeText: {
    fontWeight: "700",
  },
});
