import { create } from "zustand";
import { api } from "../utils/api";

type ServerSettings = {
  monthlyBudget: number;
  hasOnboarded: boolean;
  lastSeenWeekKey: string | null;
};

type SettingsStore = ServerSettings & {
  // true only after settings were loaded successfully. Screens that act on
  // hasOnboarded / lastSeenWeekKey must wait for this, otherwise every user
  // briefly looks like a brand-new one.
  loaded: boolean;

  fetchSettings: () => Promise<void>;
  reset: () => void;

  // Rejects (after rolling back) if the server call fails, so the UI can show an error.
  setMonthlyBudget: (n: number) => Promise<void>;

  // Low-stakes flags: kept for the session even if the sync fails, and they never reject.
  setOnboarded: (v: boolean) => Promise<void>;
  markWeekSeen: (weekKey: string) => Promise<void>;
};

const DEFAULTS: ServerSettings = {
  monthlyBudget: 15000,
  hasOnboarded: false,
  lastSeenWeekKey: null,
};

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  ...DEFAULTS,
  loaded: false,

  fetchSettings: async () => {
    try {
      const s = await api.get<ServerSettings>("/settings");
      set({
        monthlyBudget: s.monthlyBudget,
        hasOnboarded: s.hasOnboarded,
        lastSeenWeekKey: s.lastSeenWeekKey,
        loaded: true,
      });
    } catch {
      // Leave loaded=false so nothing acts on default values
    }
  },

  reset: () => set({ ...DEFAULTS, loaded: false }),

  setMonthlyBudget: async (n) => {
    const previous = get().monthlyBudget;
    set({ monthlyBudget: n });
    try {
      await api.patch("/settings", { monthlyBudget: n });
    } catch (e) {
      set({ monthlyBudget: previous });
      throw e;
    }
  },

  setOnboarded: async (v) => {
    set({ hasOnboarded: v });
    api.patch("/settings", { hasOnboarded: v }).catch(() => {});
  },

  markWeekSeen: async (weekKey) => {
    set({ lastSeenWeekKey: weekKey });
    api.patch("/settings", { lastSeenWeekKey: weekKey }).catch(() => {});
  },
}));