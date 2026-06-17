import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Category =
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
  date: string;           // ISO string
  goalId?: string;         // which goal this contributes to, if any
};

type ExpenseStore = {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
 
  // Derived helpers
  getTodayTotal: () => number;
  getMonthTotal: () => number;
  getExpensesByGoal: (goalId: string) => Expense[];
  getExpensesByDateRange: (start: string, end: string) => Expense[];
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
 
      addExpense: (expense) =>
        set((state) => ({
          expenses: [{ ...expense, id: expense.id || generateId() }, ...state.expenses],
        })),
 
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
 
      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
 
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
 
      getExpensesByGoal: (goalId) => {
        return get().expenses.filter((e) => e.goalId === goalId);
      },
 
      getExpensesByDateRange: (start, end) => {
        const startDate = new Date(start).getTime();
        const endDate = new Date(end).getTime();
        return get().expenses.filter((e) => {
          const d = new Date(e.date).getTime();
          return d >= startDate && d <= endDate;
        });
      },
    }),
    {
      name: "expense-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);