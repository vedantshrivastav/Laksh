import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { ProgressBar } from "react-native-paper";
import Header from "../common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
import ExpenseSheet from "../components/ExpenseSheet";
import { useState } from "react";
import { Category, useExpenseStore } from "../storage/useExpenseStore";
import DATA from "../constants/expenseData";
import { useSettingsStore } from "../storage/useSettingsStore";
import AskLaksh from "../components/AskLaksh";
export default function Home() {
  const renderItem = ({ item }: { item: (typeof DATA)[number] }) => (
    <TouchableOpacity
      style={styles.ExpenseCard}
      onPress={() => openSheet(item.category)}
    >
      {item.Icon}
      <Text style={[styles.text, { textAlign: "center" }]}>{item.name}</Text>
    </TouchableOpacity>
  );
  const expenses = useExpenseStore((s) => s.expenses);
  const monthlyBudget = useSettingsStore((s) => s.monthlyBudget);
  const todayTotal = useExpenseStore((s) => s.getTodayTotal());
  const monthTotal = useExpenseStore((s) => s.getMonthTotal());

  const [visible, setVisible] = useState(false);
  const [sheetCategory, setSheetCategory] = useState<Category>("food");
  const [chatVisible, setChatVisible] = useState(false);

  const openSheet = (c: Category = "food") => {
    setSheetCategory(c);
    setVisible(true);
  };

  const budgetPercent =
    monthlyBudget > 0 ? Math.min(monthTotal / monthlyBudget, 1) : 0;
  const budgetLeft = Math.max(monthlyBudget - monthTotal, 0);

  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  // Daily average from previous days this month (excluding today)
  const pastDays = now.getDate() - 1;
  const dailyAvg = pastDays > 0 ? (monthTotal - todayTotal) / pastDays : 0;
  const diffPercent =
    dailyAvg > 0
      ? Math.round(((todayTotal - dailyAvg) / dailyAvg) * 100)
      : null;

  const analysisText =
    diffPercent === null
      ? "Log a few days to see your daily average"
      : diffPercent >= 0
        ? `You spent ${diffPercent}% more than daily average`
        : `You spent ${Math.abs(diffPercent)}% less than daily average`;

  const insight =
    budgetPercent > 0.8
      ? "You've used over 80% of your budget. Slow down for the rest of the month."
      : todayTotal === 0
        ? "No spending today. Nice start!"
        : `You've spent ₹${todayTotal.toLocaleString("en-IN")} today. Budget is ${Math.round(
            budgetPercent * 100,
          )}% used.`;

  const recent = expenses.slice(0, 5);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.main}>
          {/* Daily Average Spending */}
          <View style={[styles.card, { marginTop: 30 }]}>
            <Text style={styles.dailySpentText}>TODAY</Text>
            <Text style={styles.dailySpentValue}>
              ₹ {todayTotal.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.dailySpentAnalysis}>{analysisText}</Text>
            <TouchableOpacity
              style={styles.logExpenseButton}
              onPress={() => openSheet()}
            >
              <Ionicons name="add-outline" size={18} color="black" />
              <Text style={{ fontWeight: "700" }}>Log an expense</Text>
            </TouchableOpacity>
          </View>

          {/* Expense cards flatlist*/}
          <View>
            <FlatList
              data={DATA}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.flatListContent}
            />
          </View>

          {/* Monthly Budget AI */}
          <View style={[styles.card, { paddingVertical: 14 }]}>
            <View style={[styles.row, styles.monthlyBudgetHeader]}>
              <Text style={styles.monthlyBudgetText}>Monthly Budget</Text>
              <Text style={styles.monthlyBudgetValue}>
                ₹{budgetLeft.toLocaleString("en-IN")} left
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={budgetPercent}
                color={budgetPercent > 0.8 ? "#EF4444" : "#E8A045"}
              />
              <View style={styles.progressInfoRow}>
                <Text style={styles.progressPercentage}>
                  {Math.round(budgetPercent * 100)}% spent
                </Text>
                <Text style={styles.daysRemaining}>
                  {daysRemaining} DAYS REMAINING
                </Text>
              </View>
            </View>
          </View>

          {/* AI Insights */}
          <View style={[styles.card, { gap: 8 }]}>
            <Text style={styles.AiInsightTitle}>LAKSH INSIGHT</Text>
            <View style={styles.AiInsightValueContainer}>
              <Text style={styles.AiInsightValue}>"{insight}"</Text>
            </View>
          </View>
          {/* Recent Expenses */}
          <View
            style={[
              styles.card,
              { alignItems: "stretch", paddingHorizontal: 16, gap: 10 },
            ]}
          >
            <Text style={styles.AiInsightTitle}>RECENT</Text>
            {recent.length === 0 ? (
              <Text style={{ color: "#D6C3B1", textAlign: "center" }}>
                No expenses yet. Tap "Log an expense" to add one.
              </Text>
            ) : (
              recent.map((e) => {
                const icon = DATA.find((d) => d.category === e.category)?.Icon;
                return (
                  <View
                    key={e.id}
                    style={[styles.row, { alignItems: "center", gap: 10 }]}
                  >
                    {icon}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "white" }}>{e.label}</Text>
                      {!!e.note && (
                        <Text style={styles.daysRemaining}>{e.note}</Text>
                      )}
                    </View>
                    <Text style={{ color: "#FFBE71", fontWeight: "600" }}>
                      ₹{e.amount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      <ExpenseSheet
        visible={visible}
        initialCategory={sheetCategory}
        onClose={() => setVisible(false)}
      />
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => setChatVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={22} color="black" />
      </TouchableOpacity>
      <AskLaksh visible={chatVisible} onClose={() => setChatVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  main: {
    flex: 1,
    backgroundColor: colors.background,
    gap: 2,
    // justifyContent: "space-around",
  },
  logExpenseButton: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "#E8A045",
    paddingVertical: 8,
    alignContent: "center",
    paddingHorizontal: 80,
    borderRadius: 4,
    gap: 4,
  },
  flatListContent: {
    gap: 11,
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  progressContainer: {
    width: "90%",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  dailySpending: {
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E2025",
    marginHorizontal: 18,
    marginVertical: 6,
    paddingVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#524437",
  },
  ExpenseCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 23,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  chatFab: {
    position: "absolute",
    right: 20,
    bottom: 8, // sits above the bottom tab bar
    width: 40,
    height: 40,
    borderRadius: 26,
    backgroundColor: "#E8A045",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  monthlyBudgetHeader: {
    alignItems: "center",
    // justifyContent: "space-between",
    marginBottom: 4,
    gap: 90,
  },
  dailySpentText: {
    fontSize: 12,
    marginLeft: 8,
    color: "#ffffff",
  },
  dailySpentValue: {
    color: "#FFBE71",
    fontSize: 35,
    fontWeight: "bold",
  },
  dailySpentAnalysis: {
    fontSize: 12,
    color: "#D6C3B1",
  },
  monthlyBudgetText: {
    color: "#E2E2E9",
    fontSize: 14,
  },
  monthlyBudgetValue: {
    color: "#FFBE71",
    fontSize: 16,
    fontWeight: "500",
  },
  goalText: {
    alignSelf: "flex-start",
    color: "#E2E2E9",
    marginLeft: 20,
    marginBottom: 16,
  },
  aiInsights: {
    justifyContent: "center",
    alignItems: "center",
  },
  aiInsightsText: {
    color: "white",
  },
  row: {
    flexDirection: "row",
    // gap: 8,
  },
  stats: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  progressPercentage: {
    color: "#D6C3B1",
    fontSize: 12,
  },
  daysRemaining: {
    color: "#D6C3B1",
    fontSize: 12,
  },
  // dailySpentValue: {
  //   color: "#FFBE71",
  //   fontSize: 24,
  //   fontWeight: "bold",
  // },
  text: {
    color: "white",
    fontSize: 12,
  },
  AiInsightTitle: {
    color: "#FFBE71",
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  AiInsightValue: {
    color: "#E2E2E9",
    fontStyle: "italic",
  },
  AiInsightValueContainer: {
    marginHorizontal: 20,
  },
});
