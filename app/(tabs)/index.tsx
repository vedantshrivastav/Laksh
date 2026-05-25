import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.main}>
        {/* Daily Average Spending */}
        <View style={styles.dailySpending}>
          <Text style={styles.text}>Daily Average Spending</Text>
          <Text style={styles.text}>₹ 1,420.50</Text>
          <Text style={styles.text}>You spent 12% more than daily average</Text>
        </View>

        {/* Monthly Budget AI */}
        <View style={styles.monthlyBudget}>
          <View style={styles.row}>
            <Text style={styles.text}>Monthly Budget</Text>
            <Text style={styles.text}>₹12,400 left</Text>
          </View>

          <Text style={styles.text}>Goal : ₹45,0000.00</Text>

          <View>{/* Progress bar */}</View>

          <View style={styles.row}>
            <View>
              <Text style={styles.text}>AVG.DAILY</Text>
              <Text style={styles.text}>₹1,550</Text>
            </View>

            <View>
              <Text style={styles.text}>PREDICTED</Text>
              <Text style={styles.text}>₹42,500</Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.aiInsights}>
          <Text style={styles.text}>AI INSIGHT</Text>
          <Text style={styles.text}>
            "Your subscription spending has increased by 14% this month.
            Consider reviewing your active streaming services to save
            approximately ₹850 before next billing cycle."
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-around",
  },

  dailySpending: {
    justifyContent: "center",
    alignItems: "center",
  },

  monthlyBudget: {
    justifyContent: "center",
    alignItems: "center",
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

  text: {
    color: "white",
  },
});
