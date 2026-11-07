import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { colors, radius } from "../constants/theme";
import { useExpenseStore } from "../storage/useExpenseStore";
import { useGoalStore } from "../storage/useGoalStore";
import { useSettingsStore } from "../storage/useSettingsStore";
import { answerQuery } from "../utils/queryAgent";
import { askLLM } from "../utils/llmAgent";

type Message = {
  id: string;
  from: "user" | "laksh";
  text: string;
  offline?: boolean; // true when the answer came from the on-device fallback
};

const SUGGESTIONS = [
  "How much did I spend today?",
  "How's my goal going?",
  "What's my current streak?",
  "Am I doing okay this month?",
];

export default function AskLaksh({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const expenses = useExpenseStore((s) => s.expenses);
  const goals = useGoalStore((s) => s.goals);
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const monthlyBudget = useSettingsStore((s) => s.monthlyBudget);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "laksh",
      text: "Hey! Ask me about your spending, budget, goals, or streak.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<FlatList>(null);
  const idCounter = useRef(0);
  const nextId = () => String(++idCounter.current);

  const scrollToEnd = () =>
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "user", text: trimmed },
    ]);
    setInput("");
    setThinking(true);
    scrollToEnd();

    // 1. Try the real AI on the backend
    const llmAnswer = await askLLM(trimmed);

    // 2. If that fails (offline, rate limit, server asleep), answer from on-device data
    const reply: Message = llmAnswer
      ? { id: nextId(), from: "laksh", text: llmAnswer }
      : {
          id: nextId(),
          from: "laksh",
          text: answerQuery(trimmed, {
            expenses,
            goals,
            activeGoalId,
            monthlyBudget,
          }),
          offline: true,
        };

    setMessages((prev) => [...prev, reply]);
    setThinking(false);
    scrollToEnd();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheet}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ask Laksh</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === "user" ? styles.userBubble : styles.agentBubble,
              ]}
            >
              <Text
                style={
                  item.from === "user" ? styles.userText : styles.agentText
                }
              >
                {item.text}
              </Text>
              {item.offline && (
                <Text style={styles.offlineTag}>Answered offline</Text>
              )}
            </View>
          )}
          ListFooterComponent={
            thinking ? (
              <View style={[styles.bubble, styles.agentBubble]}>
                <Text style={styles.agentText}>Laksh is thinking...</Text>
              </View>
            ) : null
          }
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Suggestion chips (shown only before the user has asked anything) */}
        {messages.length === 1 && (
          <View style={styles.suggestionRow}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => send(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your spending..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            maxLength={300}
          />
          <TouchableOpacity
            style={[styles.sendButton, thinking && { opacity: 0.5 }]}
            onPress={() => send(input)}
            disabled={thinking}
          >
            <Ionicons name="arrow-up" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "75%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: "#E8A045",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: "#1E2025",
    borderWidth: 1,
    borderColor: "#524437",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "black",
    fontWeight: "600",
  },
  agentText: {
    color: colors.textPrimary,
  },
  offlineTag: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 6,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: "#524437",
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A2B30",
  },
  input: {
    flex: 1,
    backgroundColor: "#1E2025",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#524437",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: "#E8A045",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
