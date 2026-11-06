import { create } from "zustand";
import { api } from "../utils/api";
import type { Category } from "./useExpenseStore";

export type Commitment = {
  id: string;
  category: Category;
  maxCount: number;
  period: "day" | "week";
  createdAt: string;
};

type CommitmentInput = Omit<Commitment, "id" | "createdAt">;

type CommitmentStore = {
  commitments: Commitment[];
  loaded: boolean;
  error: string | null;

  fetchCommitments: () => Promise<void>;
  reset: () => void;

  // Update the UI immediately, then sync. Rejects (after rolling back) if the server call fails.
  addCommitment: (c: CommitmentInput) => Promise<Commitment>;
  deleteCommitment: (id: string) => Promise<void>;
};

const TEMP_PREFIX = "temp-";
const isTemp = (id: string) => id.startsWith(TEMP_PREFIX);

export const useCommitmentStore = create<CommitmentStore>()((set, get) => ({
  commitments: [],
  loaded: false,
  error: null,

  fetchCommitments: async () => {
    try {
      const fetched = await api.get<Commitment[]>("/commitments");
      set((state) => ({
        commitments: [...state.commitments.filter((c) => isTemp(c.id)), ...fetched],
        loaded: true,
        error: null,
      }));
    } catch (e) {
      set({
        loaded: true,
        error: e instanceof Error ? e.message : "Failed to load rules",
      });
    }
  },

  reset: () => set({ commitments: [], loaded: false, error: null }),

  addCommitment: async (input) => {
    const tempId = `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const temp: Commitment = { ...input, id: tempId, createdAt: new Date().toISOString() };

    set((state) => ({ commitments: [temp, ...state.commitments] }));

    try {
      const created = await api.post<Commitment>("/commitments", input);

      let replaced = false;
      set((state) => ({
        commitments: state.commitments.map((c) => {
          if (c.id === tempId) {
            replaced = true;
            return created;
          }
          return c;
        }),
      }));

      // deleted while still saving: remove it from the server too
      if (!replaced) api.delete(`/commitments/${created.id}`).catch(() => {});

      return created;
    } catch (e) {
      set((state) => ({ commitments: state.commitments.filter((c) => c.id !== tempId) }));
      throw e;
    }
  },

  deleteCommitment: async (id) => {
    const removed = get().commitments.find((c) => c.id === id);
    set((state) => ({ commitments: state.commitments.filter((c) => c.id !== id) }));

    if (isTemp(id)) return;

    try {
      await api.delete(`/commitments/${id}`);
    } catch (e) {
      if (removed) set((state) => ({ commitments: [removed, ...state.commitments] }));
      throw e;
    }
  },
}));