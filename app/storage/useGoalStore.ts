import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

type GoalStore = {
  goals: Goal[];
  activeGoalId: string | null;

  addGoal: (goal: Omit<Goal, "id" | "savedAmount" | "isCompleted">) => string;
  deleteGoal: (id: string) => void;
  setActiveGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number) => void;

  // Derived helpers
  getActiveGoal: () => Goal | undefined;
  getOtherGoals: () => Goal[];
  getGoalProgress: (goalId: string) => number;
  getDaysLeft: (goalId: string) => number;
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [],
      activeGoalId: null,

      addGoal: (goalInput) => {
        const id = generateId();
        const newGoal: Goal = {
          ...goalInput,
          id,
          savedAmount: 0,
          isCompleted: false,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
          // First goal becomes active automatically
          activeGoalId: state.activeGoalId ?? id,
        }));
        return id;
      },

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          activeGoalId: state.activeGoalId === id ? null : state.activeGoalId,
        })),

      setActiveGoal: (id) => set({ activeGoalId: id }),

      contributeToGoal: (goalId, amount) =>
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== goalId) return g;
            const newSaved = g.savedAmount + amount;
            return {
              ...g,
              savedAmount: newSaved,
              isCompleted: newSaved >= g.targetAmount,
            };
          }),
        })),

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
        if (!goal) return 0;
        return Math.min(goal.savedAmount / goal.targetAmount, 1);
      },

      getDaysLeft: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return 0;
        const target = new Date(goal.targetDate).getTime();
        const now = Date.now();
        return Math.max(Math.ceil((target - now) / (1000 * 60 * 60 * 24)), 0);
      },
    }),
    {
      name: "goal-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);