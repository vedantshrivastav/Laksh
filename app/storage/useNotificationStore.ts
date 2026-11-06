import { create } from "zustand";
import { api } from "../utils/api";

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
  loaded: boolean;

  fetchNotifications: () => Promise<void>;
  reset: () => void;

  // These never reject: notifications are low-stakes, so a failed sync is simply undone.
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const TEMP_PREFIX = "temp-";
const isTemp = (id: string) => id.startsWith(TEMP_PREFIX);

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  loaded: false,

  fetchNotifications: async () => {
    try {
      const fetched = await api.get<AppNotification[]>("/notifications");
      set((state) => ({
        notifications: [...state.notifications.filter((n) => isTemp(n.id)), ...fetched],
        loaded: true,
      }));
    } catch {
      set({ loaded: true });
    }
  },

  reset: () => set({ notifications: [], loaded: false }),

  addNotification: async (input) => {
    const tempId = `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const temp: AppNotification = {
      ...input,
      id: tempId,
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((state) => ({ notifications: [temp, ...state.notifications] }));

    try {
      const created = await api.post<AppNotification>("/notifications", input);

      const wasRead = get().notifications.find((n) => n.id === tempId)?.read ?? false;
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === tempId ? created : n)),
      }));

      // the user opened it while it was still saving: carry that over to the server
      if (wasRead) api.patch(`/notifications/${created.id}/read`).catch(() => {});
    } catch {
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== tempId) }));
    }
  },

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    if (isTemp(id)) return;

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
      }));
    }
  },

  markAllRead: async () => {
    const wasUnread = new Set(get().notifications.filter((n) => !n.read).map((n) => n.id));
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) }));

    try {
      await api.patch("/notifications/read-all");
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          wasUnread.has(n.id) ? { ...n, read: false } : n
        ),
      }));
    }
  },

  clearAll: async () => {
    const previous = get().notifications;
    set({ notifications: [] });

    try {
      await api.delete("/notifications");
    } catch {
      set((state) => ({ notifications: [...state.notifications, ...previous] }));
    }
  },
}));