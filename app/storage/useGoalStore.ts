import { create } from "zustand";
import { api } from "../utils/api";

export type Goal = {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  savedAmount: number;
  startDate: string;
  targetDate: string;
  isCompleted: boolean;
};

type GoalInput = Omit<Goal, "id" | "savedAmount" | "isCompleted">;

type GoalStore = {
  goals: Goal[];
  activeGoalId: string | null;
  loaded: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  reset: () => void; // clears everything, called on logout

  // These update the UI immediately, then sync with the server.
  // The returned promise rejects (after rolling the change back) if the server call fails.
  addGoal: (goal: GoalInput) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  setActiveGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<void>;

  // Derived helpers (unchanged, they just read from state)
  getActiveGoal: () => Goal | undefined;
  getOtherGoals: () => Goal[];
  getGoalProgress: (goalId: string) => number;
  getDaysLeft: (goalId: string) => number;
};

const TEMP_PREFIX = "temp-";
const isTemp = (id: string) => id.startsWith(TEMP_PREFIX);

export const useGoalStore = create<GoalStore>()((set, get) => ({
  goals: [],
  activeGoalId: null,
  loaded: false,
  error: null,

  fetchGoals: async () => {
    try {
      const res = await api.get<{ goals: Goal[]; activeGoalId: string | null }>("/goals");
      set((state) => ({
        // keep anything still being saved so a slow fetch doesn't wipe it out
        goals: [...res.goals, ...state.goals.filter((g) => isTemp(g.id))],
        activeGoalId:
          state.activeGoalId && isTemp(state.activeGoalId)
            ? state.activeGoalId
            : res.activeGoalId,
        loaded: true,
        error: null,
      }));
    } catch (e) {
      set({
        loaded: true,
        error: e instanceof Error ? e.message : "Failed to load goals",
      });
    }
  },

  reset: () => set({ goals: [], activeGoalId: null, loaded: false, error: null }),

  addGoal: async (input) => {
    const tempId = `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const previousActive = get().activeGoalId;
    const tempGoal: Goal = { ...input, id: tempId, savedAmount: 0, isCompleted: false };

    // 1. show it right away; the first goal becomes active automatically (the server does the same)
    set((state) => ({
      goals: [...state.goals, tempGoal],
      activeGoalId: state.activeGoalId ?? tempId,
    }));

    try {
      // 2. save it, then swap the temporary entry for the real one
      const created = await api.post<Goal>("/goals", input);

      let replaced = false;
      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id === tempId) {
            replaced = true;
            return created;
          }
          return g;
        }),
        activeGoalId: state.activeGoalId === tempId ? created.id : state.activeGoalId,
      }));

      // The user deleted it while it was still saving: remove it from the server too
      if (!replaced) api.delete(`/goals/${created.id}`).catch(() => {});

      return created;
    } catch (e) {
      // 3. failed: take it back out
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== tempId),
        activeGoalId: state.activeGoalId === tempId ? previousActive : state.activeGoalId,
      }));
      throw e;
    }
  },

  deleteGoal: async (id) => {
    const { goals, activeGoalId } = get();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return;

    const removed = goals[index];
    const remaining = goals.filter((g) => g.id !== id);

    // If the active goal is deleted, the next goal takes over (the server does the same)
    set({
      goals: remaining,
      activeGoalId: activeGoalId === id ? (remaining[0]?.id ?? null) : activeGoalId,
    });

    if (isTemp(id)) return; // never reached the server, nothing else to do

    try {
      await api.delete(`/goals/${id}`);
    } catch (e) {
      set((state) => {
        const restored = [...state.goals];
        restored.splice(Math.min(index, restored.length), 0, removed);
        return {
          goals: restored,
          activeGoalId: activeGoalId === id ? id : state.activeGoalId,
        };
      });
      throw e;
    }
  },

  setActiveGoal: async (id) => {
    if (isTemp(id)) throw new Error("Still saving, try again in a moment");

    const previous = get().activeGoalId;
    if (previous === id) return;

    set({ activeGoalId: id });
    try {
      await api.patch(`/goals/${id}/activate`);
    } catch (e) {
      set({ activeGoalId: previous });
      throw e;
    }
  },

  contributeToGoal: async (goalId, amount) => {
    if (isTemp(goalId)) throw new Error("Still saving, try again in a moment");

    const original = get().goals.find((g) => g.id === goalId);
    if (!original) return;

    const newSaved = Math.min(original.savedAmount + amount, original.targetAmount);
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? { ...g, savedAmount: newSaved, isCompleted: newSaved >= g.targetAmount }
          : g
      ),
    }));

    try {
      const saved = await api.post<Goal>(`/goals/${goalId}/contribute`, { amount });
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? saved : g)),
      }));
    } catch (e) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? original : g)),
      }));
      throw e;
    }
  },

  getActiveGoal: () => {
    const state = get();
    return state.goals.find((g) => g.id === state.activeGoalId);
  },

  getOtherGoals: () => {
    const state = get();
    return state.goals.filter((g) => g.id !== state.activeGoalId);
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal || goal.targetAmount <= 0) return 0;
    return Math.min(goal.savedAmount / goal.targetAmount, 1);
  },

  getDaysLeft: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return 0;
    const target = new Date(goal.targetDate).getTime();
    return Math.max(Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)), 0);
  },
}));