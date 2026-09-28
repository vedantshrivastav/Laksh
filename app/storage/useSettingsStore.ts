import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsStore = {
  monthlyBudget: number;
  setMonthlyBudget: (n: number) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      monthlyBudget: 15000,
      setMonthlyBudget: (n) => set({ monthlyBudget: n }),
    }),
    { name: "settings-store", storage: createJSONStorage(() => AsyncStorage) }
  )
);