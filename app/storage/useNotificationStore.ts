import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationType =
  | "budget"
  | "goal"
  | "commitment"
  | "weekly_report"
  | "pattern"
  | "frequency"
  | "general";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // ISO
  read: boolean;
};

type NotificationStore = {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              ...n,
              id: generateId(),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 100), // cap history so storage doesn't grow unbounded
        })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "notification-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);