import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { ProgressBar } from "react-native-paper";
import Header from "../common/Header";
import Ionicons from "@expo/vector-icons/Ionicons";
// import { DATA } from "../constants/ExpenseCard";
export const DATA = [
  {
    id: "1",
    name: "Chai",
    Icon: <Ionicons name="cafe" size={24} color="#E8A045" />,
  },
  {
    id: "2",
    name: "Food",
    Icon: <Ionicons name="restaurant" size={24} color="#E8A045" />,
  },
  {
    id: "3",
    name: "Cab",
    Icon: <Ionicons name="car" size={24} color="#E8A045" />,
  },
  {
    id: "4",
    name: "Shopping",
    Icon: <Ionicons name="card-outline" size={24} color="#E8A045" />,
  },
];
const renderItem = ({ item }: any) => {
  return (
    <View style={styles.ExpenseCard}>
      {item.Icon}
      <Text style={[styles.text, { textAlign: "center" }]}>{item.name}</Text>
    </View>
  );
};
export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.main}>
          {/* Daily Average Spending */}
          <View style={[styles.card, { marginTop: 30 }]}>
            <Text style={styles.dailySpentText}>DAILY SPEND</Text>
            <Text style={styles.dailySpentValue}>₹ 1,420.50</Text>
            <Text style={styles.dailySpentAnalysis}>
              You spent 12% more than daily average
            </Text>
          </View>

          {/* Expense cards flatlist*/}
          <View>
            <FlatList
              data={DATA}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={{
                gap: 16,
                paddingHorizontal: 18,
                marginVertical: 8,
                // paddingVertical: 20,
                // marginHorizontal: 18,
              }}
            />
          </View>

          {/* Monthly Budget AI */}
          <View style={styles.card}>
            <View style={[styles.row, styles.monthlyBudgetHeader]}>
              <Text style={styles.monthlyBudgetText}>Monthly Budget</Text>
              <Text style={styles.monthlyBudgetValue}>₹12,400 left</Text>
            </View>

            <Text style={styles.goalText}>Goal : ₹45,0000.00</Text>

            <View style={{ width: "90%", paddingHorizontal: 8, marginTop: 8 }}>
              <ProgressBar progress={0.3} color="#E8A045" />
              <View
                style={[
                  styles.row,
                  {
                    justifyContent: "space-between",
                    marginTop: 4,
                    marginBottom: 20,
                  },
                ]}
              >
                <Text style={styles.progressPercentage}>72% spent</Text>
                <Text style={styles.daysRemaining}>21 DAYS REMAINING</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={{ width: "50%", marginLeft: 24 }}>
                <Text style={styles.text}>AVG.DAILY</Text>
                <Text style={styles.text}>₹1,550</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.text}>PREDICTED</Text>
                <Text style={styles.text}>₹42,500</Text>
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
  main: {
    flex: 1,
    backgroundColor: colors.background,
    gap: 30,
    // justifyContent: "space-around",
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
    marginVertical: 8,
    paddingVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#524437",
  },
  ExpenseCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
  },
  monthlyBudgetHeader: {
    justifyContent: "center",
    alignItems: "center",
    gap: 60,
    marginBottom: 4,
  },
  dailySpentText: {
    fontSize: 12,
    color: "#ffffff",
  },
  dailySpentValue: {
    color: "#FFBE71",
    fontSize: 24,
    fontWeight: "bold",
  },
  dailySpentAnalysis: {
    fontSize: 12,
    color: "#D6C3B1",
  },
  monthlyBudgetText: {
    color: "#E2E2E9",
    fontSize: 20,
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
    gap: 8,
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
  dailySpentValue: {
    color: "#FFBE71",
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    color: "white",
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
