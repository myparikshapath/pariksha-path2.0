import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

export type StateCreator<S> = import("zustand").StateCreator<S, [], []>;

type Middleware<S> = (config: StateCreator<S>) => StateCreator<S>;

export const composeMiddlewares = <S>(...middlewares: Middleware<S>[]) =>
  (config: StateCreator<S>) => middlewares.reduce((acc, mw) => mw(acc), config);

export { create, devtools, persist, createJSONStorage };
