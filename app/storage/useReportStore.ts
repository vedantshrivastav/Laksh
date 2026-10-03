import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ReportStore = {
  lastSeenWeekKey: string | null;
  markWeekSeen: (weekKey: string) => void;
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      lastSeenWeekKey: null,
      markWeekSeen: (weekKey) => set({ lastSeenWeekKey: weekKey }),
    }),
    {
      name: "report-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);