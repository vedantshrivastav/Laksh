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
import { use, useState } from "react";
import { useExpenseStore } from "../storage/useExpenseStore";
import DATA from "../constants/expenseData";
export default function Home() {
  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.ExpenseCard}>
        {item.Icon}
        <Text style={[styles.text, { textAlign: "center" }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  const TodayExpense = useExpenseStore((state) => state.getTodayTotal());
  const [visible, setVisible] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.main}>
          {/* Daily Average Spending */}
          <View style={[styles.card, { marginTop: 30 }]}>
            <Text style={styles.dailySpentText}>TODAY</Text>
            <Text style={styles.dailySpentValue}>
              ₹ {TodayExpense.toFixed(2)}
            </Text>
            <Text style={styles.dailySpentAnalysis}>
              You spent 12% more than daily average
            </Text>
            <View style={styles.logExpenseButton}>
              <Ionicons name="add-outline" size={18} color="black" />
              <Text style={{ fontWeight: "700" }}>Log an expense</Text>
            </View>
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
              <Text style={styles.monthlyBudgetValue}>₹12,400 left</Text>
            </View>
            <View style={styles.progressContainer}>
              <ProgressBar progress={0.3} color="#E8A045" />
              <View style={styles.progressInfoRow}>
                <Text style={styles.progressPercentage}>72% spent</Text>
                <Text style={styles.daysRemaining}>21 DAYS REMAINING</Text>
              </View>
            </View>
          </View>

          {/* AI Insights */}
          <View style={[styles.card, { gap: 8 }]}>
            <Text style={styles.AiInsightTitle}>LAKSH INSIGHT</Text>
            <View style={styles.AiInsightValueContainer}>
              <Text style={styles.AiInsightValue}>
                "Your subscription spending has increased by 14% this month.
                Consider reviewing your active streaming services to save
                approximately ₹850 before next billing cycle."
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
