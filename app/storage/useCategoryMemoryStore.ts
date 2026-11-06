import { create } from "zustand";
import { api } from "../utils/api";
import type { Category } from "./useExpenseStore";

export type MemoryEntry = {
  category: Category;
  count: number;
};

type CategoryMemoryStore = {
  memory: Record<string, MemoryEntry>; // keyword -> entry
  fetchMemory: () => Promise<void>;
  reset: () => void;
  learn: (keyword: string, category: Category) => void;
};

export const useCategoryMemoryStore = create<CategoryMemoryStore>()((set) => ({
  memory: {},

  fetchMemory: async () => {
    try {
      const memory = await api.get<Record<string, MemoryEntry>>("/category-memory");
      set({ memory });
    } catch {
      // Nice-to-have data: if it fails to load, suggestions just start empty
    }
  },

  reset: () => set({ memory: {} }),

  learn: (keyword, category) => {
    const key = keyword.trim().toLowerCase();
    if (!key) return;

    // Same category again -> reinforce. Different category -> the user corrected it, reset to 1.
    set((state) => {
      const existing = state.memory[key];
      const updated: MemoryEntry =
        existing && existing.category === category
          ? { category, count: existing.count + 1 }
          : { category, count: 1 };
      return { memory: { ...state.memory, [key]: updated } };
    });

    // Best effort: if this sync fails, the server just learns it next time
    api.post("/category-memory/learn", { keyword: key, category }).catch(() => {});
  },
}));