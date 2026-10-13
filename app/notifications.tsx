import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  AppNotification,
  NotificationType,
  useNotificationStore,
} from "./storage/useNotificationStore";
import { colors } from "./constants/theme";

const TYPE_ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  budget: "wallet-outline",
  goal: "flag-outline",
  commitment: "shield-checkmark-outline",
  weekly_report: "stats-chart-outline",
  pattern: "repeat-outline",
  frequency: "pulse-outline",
  general: "sparkles-outline",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.unreadRow]}
      onPress={() => markRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={TYPE_ICON[item.type]} size={18} color="#E8A045" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 22 }} />
      </View>

      {notifications.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.actionText}>Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.actionText, { color: "#EF4444" }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-off-outline"
            size={36}
            color="#5A5B61"
          />
          <Text style={styles.emptyText}>
            No notifications yet. Laksh will let you know when it notices
            something.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2B30",
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  actionText: { color: "#8A8B91", fontSize: 12, fontWeight: "600" },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    color: "#8A8B91",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#2A2B30",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginTop: 10,
  },
  unreadRow: { borderColor: "#524437" },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2A2418",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  title: { color: "white", fontSize: 13, fontWeight: "700", marginBottom: 2 },
  message: { color: "#D6C3B1", fontSize: 12, lineHeight: 17 },
  time: { color: "#5A5B61", fontSize: 11, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8A045",
    marginLeft: 8,
    marginTop: 4,
  },
});
