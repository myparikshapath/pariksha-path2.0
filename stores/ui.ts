import { create } from "zustand";

type UIState = {
  globalLoading: boolean;
};

type UIActions = {
  setState: (s: Partial<UIState>) => void;
};

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>(() => ({
  globalLoading: false,
  setState: () => {},
}));
