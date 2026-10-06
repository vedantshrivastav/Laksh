import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { colors, radius } from "../constants/theme";
import { useExpenseStore } from "../storage/useExpenseStore";
import { useCategoryMemoryStore } from "../storage/useCategoryMemoryStore";
import { parseStatementCsv, type ParsedRow } from "../utils/parseStatementCsv";
import { extractKeyword } from "../utils/learnCategory";
import DATA from "../constants/expenseData";

export default function ImportStatementSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const memory = useCategoryMemoryStore((s) => s.memory);
  const learn = useCategoryMemoryStore((s) => s.learn);

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRows([]);
    setError(null);
    setLoading(false);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values", "*/*"],
    });
    if (result.canceled) return;

    setLoading(true);
    setError(null);
    try {
      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const { rows: parsed, error: parseError } = parseStatementCsv(
        content,
        memory,
      );
      if (parseError) setError(parseError);
      setRows(parsed);
    } catch (e) {
      setError("Couldn't read this file. Try exporting your statement as CSV.");
    } finally {
      setLoading(false);
    }
  };

  const toggleInclude = (id: string) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, include: !r.include } : r)),
    );

  const cycleCategory = (id: string) =>
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const idx = DATA.findIndex((d) => d.category === r.suggestedCategory);
        const next = DATA[(idx + 1) % DATA.length];
        return { ...r, suggestedCategory: next.category };
      }),
    );

  const confirmImport = () => {
    const included = rows.filter((r) => r.include);
    if (included.length === 0) return;

    included.forEach((r) => {
      const label =
        DATA.find((d) => d.category === r.suggestedCategory)?.name ?? "Other";
      addExpense({
        amount: r.amount,
        category: r.suggestedCategory,
        label,
        note: r.description,
        date: r.date,
      });
      const keyword = extractKeyword(r.description);
      if (keyword) learn(keyword, r.suggestedCategory);
    });

    Alert.alert(
      "Imported",
      `Added ${included.length} expenses from your statement.`,
    );
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Import Bank Statement</Text>
          <TouchableOpacity
            onPress={() => {
              reset();
              onClose();
            }}
          >
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {rows.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Upload a CSV export of your bank statement. Laksh reads it and
              suggests categories — you confirm before anything is added.
            </Text>
            {loading ? (
              <ActivityIndicator color="#E8A045" style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.pickButton} onPress={pickFile}>
                <Text style={styles.pickText}>Choose CSV File</Text>
              </TouchableOpacity>
            )}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        ) : (
          <>
            <Text style={styles.summary}>
              Found {rows.length} transactions. Tap a category to change it,
              uncheck to skip.
            </Text>
            <FlatList
              data={rows}
              keyExtractor={(r) => r.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 12,
              }}
              renderItem={({ item }) => {
                const label =
                  DATA.find((d) => d.category === item.suggestedCategory)
                    ?.name ?? item.suggestedCategory;
                return (
                  <View style={[styles.row, !item.include && { opacity: 0.4 }]}>
                    <TouchableOpacity onPress={() => toggleInclude(item.id)}>
                      <Ionicons
                        name={item.include ? "checkbox" : "square-outline"}
                        size={20}
                        color="#E8A045"
                      />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.desc} numberOfLines={1}>
                        {item.description || "Transaction"}
                      </Text>
                      <Text style={styles.date}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.categoryChip}
                      onPress={() => cycleCategory(item.id)}
                    >
                      <Text style={styles.categoryText}>{label}</Text>
                    </TouchableOpacity>
                    <Text style={styles.amount}>
                      ₹{item.amount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                );
              }}
            />
            <TouchableOpacity
              style={styles.importButton}
              onPress={confirmImport}
            >
              <Text style={styles.importText}>
                Import {rows.filter((r) => r.include).length} Expenses
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "85%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: { flexDirection: "row", justifyContent: "space-between", margin: 20 },
  title: { color: "white", fontSize: 18, fontWeight: "bold" },
  emptyState: { paddingHorizontal: 20, alignItems: "center", marginTop: 20 },
  emptyText: {
    color: "#D6C3B1",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  pickButton: {
    backgroundColor: "#E8A045",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.sm,
  },
  pickText: { fontWeight: "700" },
  error: { color: "#EF4444", marginTop: 16, textAlign: "center" },
  summary: {
    color: "#D6C3B1",
    fontSize: 12,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  desc: { color: "white", fontSize: 13 },
  date: { color: "#8A8B91", fontSize: 11, marginTop: 2 },
  categoryChip: {
    backgroundColor: "#2A2418",
    borderWidth: 1,
    borderColor: "#E8A045",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  categoryText: { color: "#E8A045", fontSize: 11, fontWeight: "600" },
  amount: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
  importButton: {
    backgroundColor: "#E8A045",
    marginHorizontal: 20,
    marginVertical: 14,
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  importText: { fontWeight: "700" },
});
