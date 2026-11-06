import { useExpenseStore } from "./useExpenseStore";
import { useGoalStore } from "./useGoalStore";
import { useCommitmentStore } from "./useCommitmentStore";
import { useSettingsStore } from "./useSettingsStore";
import { useCategoryMemoryStore } from "./useCategoryMemoryStore";
import { useNotificationStore } from "./useNotificationStore";

/** Called when the user logs in (or the app opens with a valid session). */
export function loadAllData() {
  useExpenseStore.getState().fetchExpenses();
  useGoalStore.getState().fetchGoals();
  useCommitmentStore.getState().fetchCommitments();
  useSettingsStore.getState().fetchSettings();
  useCategoryMemoryStore.getState().fetchMemory();
  useNotificationStore.getState().fetchNotifications();
}

/** Called on logout or an expired session, so the next user never sees this user's data. */
export function resetAllData() {
  useExpenseStore.getState().reset();
  useGoalStore.getState().reset();
  useCommitmentStore.getState().reset();
  useSettingsStore.getState().reset();
  useCategoryMemoryStore.getState().reset();
  useNotificationStore.getState().reset();
}