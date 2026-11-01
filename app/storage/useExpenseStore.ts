import { create } from "zustand";
import { api } from "../utils/api";

export type Category =
  | "chai"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "health"
  | "bills"
  | "others";

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  label: string;
  note?: string;
  date: string; // ISO string
  goalId?: string; // which goal this contributes to, if any
};

type ExpenseStore = {
  expenses: Expense[];
  loaded: boolean; // false until the first fetch finishes, so screens can show a loading state
  error: string | null;

  fetchExpenses: () => Promise<void>;
  reset: () => void; // clears everything, called on logout

  // These update the UI immediately, then sync with the server.
  // The returned promise rejects (after rolling the change back) if the server call fails.
  addExpense: (expense: Omit<Expense, "id">) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id">>) => Promise<void>;

  // Derived helpers (unchanged, they just read from state)
  getTodayTotal: () => number;
  getMonthTotal: () => number;
  getExpensesByGoal: (goalId: string) => Expense[];
  getExpensesByDateRange: (start: string, end: string) => Expense[];
};

const TEMP_PREFIX = "temp-";
const isTemp = (id: string) => id.startsWith(TEMP_PREFIX);

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  loaded: false,
  error: null,

  fetchExpenses: async () => {
    try {
      const fetched = await api.get<Expense[]>("/expenses");
      set((state) => ({
        // keep anything still being saved so a slow fetch doesn't wipe it out
        expenses: [...state.expenses.filter((e) => isTemp(e.id)), ...fetched],
        loaded: true,
        error: null,
      }));
    } catch (e) {
      set({
        loaded: true,
        error: e instanceof Error ? e.message : "Failed to load expenses",
      });
    }
  },

  reset: () => set({ expenses: [], loaded: false, error: null }),

  addExpense: async (input) => {
    const tempId = `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // 1. show it right away
    set((state) => ({ expenses: [{ ...input, id: tempId }, ...state.expenses] }));

    try {
      // 2. save it, then swap the temporary entry for the real one (with its Mongo id)
      const created = await api.post<Expense>("/expenses", input);

      let replaced = false;
      set((state) => ({
        expenses: state.expenses.map((e) => {
          if (e.id === tempId) {
            replaced = true;
            return created;
          }
          return e;
        }),
      }));

      // The user deleted it while it was still saving: remove it from the server too
      if (!replaced) api.delete(`/expenses/${created.id}`).catch(() => {});

      return created;
    } catch (e) {
      // 3. failed: take it back out
      set((state) => ({ expenses: state.expenses.filter((x) => x.id !== tempId) }));
      throw e;
    }
  },

  deleteExpense: async (id) => {
    const removed = get().expenses.find((e) => e.id === id);
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));

    if (isTemp(id)) return; // never reached the server, nothing else to do

    try {
      await api.delete(`/expenses/${id}`);
    } catch (e) {
      if (removed) set((state) => ({ expenses: [removed, ...state.expenses] }));
      throw e;
    }
  },

  updateExpense: async (id, updates) => {
    if (isTemp(id)) throw new Error("Still saving, try again in a moment");

    const original = get().expenses.find((e) => e.id === id);
    if (!original) return;

    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));

    try {
      const saved = await api.patch<Expense>(`/expenses/${id}`, updates);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? saved : e)),
      }));
    } catch (e) {
      set((state) => ({
        expenses: state.expenses.map((x) => (x.id === id ? original : x)),
      }));
      throw e;
    }
  },

  getTodayTotal: () => {
    const today = new Date().toDateString();
    return get()
      .expenses.filter((e) => new Date(e.date).toDateString() === today)
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getMonthTotal: () => {
    const now = new Date();
    return get()
      .expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getExpensesByGoal: (goalId) => get().expenses.filter((e) => e.goalId === goalId),

  getExpensesByDateRange: (start, end) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    return get().expenses.filter((e) => {
      const d = new Date(e.date).getTime();
      return d >= startDate && d <= endDate;
    });
  },
}));