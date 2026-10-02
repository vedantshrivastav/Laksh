import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Category } from "./useExpenseStore";

export type Commitment = {
  id: string;
  category: Category;
  maxCount: number;
  period: "day" | "week";
  createdAt: string;
};

type CommitmentStore = {
  commitments: Commitment[];
  addCommitment: (c: Omit<Commitment, "id" | "createdAt">) => void;
  deleteCommitment: (id: string) => void;
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const useCommitmentStore = create<CommitmentStore>()(
  persist(
    (set) => ({
      commitments: [],

      addCommitment: (c) =>
        set((state) => ({
          commitments: [
            ...state.commitments,
            { ...c, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      deleteCommitment: (id) =>
        set((state) => ({
          commitments: state.commitments.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "commitment-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);