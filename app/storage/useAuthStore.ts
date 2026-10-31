import { create } from "zustand";
import {
  api,
  ApiError,
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "../utils/api";

export type AuthUser = {
  id: string;
  phone: string;
  name: string | null;
  hasOnboarded: boolean;
};

type AuthStatus = "loading" | "loggedIn" | "loggedOut";

type AuthStore = {
  status: AuthStatus;
  user: AuthUser | null;
  bootstrap: () => Promise<void>;
  loginWithToken: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

// Not persisted on purpose: the JWT itself lives in AsyncStorage (see utils/api.ts),
// and this store re-derives the status from it on every app launch.
export const useAuthStore = create<AuthStore>((set) => ({
  status: "loading",
  user: null,

  // Call once on app start: is the saved token still valid?
  bootstrap: async () => {
    const token = await getToken();
    if (!token) {
      set({ status: "loggedOut", user: null });
      return;
    }

    try {
      const user = await api.get<AuthUser>("/auth/me", { timeoutMs: 15000 });
      set({ status: "loggedIn", user });
    } catch (e) {
      if (e instanceof ApiError && e.status === 0) {
        // Offline, or a free-tier server still waking up. The token was not rejected,
        // so keep the session instead of logging the user out.
        set({ status: "loggedIn", user: null });
      } else {
        await clearToken();
        set({ status: "loggedOut", user: null });
      }
    }
  },

  loginWithToken: async (token, user) => {
    await setToken(token);
    set({ status: "loggedIn", user });
  },

  logout: async () => {
    await clearToken();
    set({ status: "loggedOut", user: null });
  },
}));

// If any API call comes back 401, drop to the login screen
setUnauthorizedHandler(() => {
  useAuthStore.setState({ status: "loggedOut", user: null });
});