"use client";
import { useStore } from "zustand";
import type { StoreApi } from "zustand";

export function useStoreSelector<TState, TSelected>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSelected
) {
  return useStore(store, selector);
}
