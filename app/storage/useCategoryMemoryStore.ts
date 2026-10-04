import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Category } from "./useExpenseStore";

export type MemoryEntry = {
  category: Category;
  count: number;
};

type CategoryMemoryStore = {
  memory: Record<string, MemoryEntry>; // keyword -> entry
  learn: (keyword: string, category: Category) => void;
};

export const useCategoryMemoryStore = create<CategoryMemoryStore>()(
  persist(
    (set) => ({
      memory: {},

      learn: (keyword, category) =>
        set((state) => {
          const key = keyword.trim().toLowerCase();
          if (!key) return state;

          const existing = state.memory[key];
          // Same category seen again -> reinforce confidence.
          // Different category than last time -> the user corrected it, reset to 1.
          const updated: MemoryEntry =
            existing && existing.category === category
              ? { category, count: existing.count + 1 }
              : { category, count: 1 };

          return { memory: { ...state.memory, [key]: updated } };
        }),
    }),
    {
      name: "category-memory-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);