"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/utils/api";
import SecureTokenStorage from "@/utils/secureStorage";

type Role = "student" | "admin" | null;

type User = {
  name: string;
  email: string;
  phone?: string;
} | null;

type AuthState = {
  isLoggedIn: boolean | null;
  role: Role;
  user: User;
  loading: boolean;
  bootstrapped: boolean;
};

type AuthActions = {
  setState: (s: Partial<AuthState>) => void;
  bootstrap: () => Promise<void>;
  login: (accessToken: string, refreshToken: string, role: Exclude<Role, null>, userPayload?: NonNullable<User>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isLoggedIn: null,
  role: null,
  user: null,
  loading: false,
  bootstrapped: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setState: (s) => set(() => ({ ...s })),

      bootstrap: async () => {
        const token = SecureTokenStorage.getAccessToken();
        const storedRole = SecureTokenStorage.getUserRole() as Role;
        if (token && storedRole) {
          set({ isLoggedIn: true, role: storedRole, loading: true });
          try {
            const res = await api.get("/auth/me");
            const userData = res.data?.user ?? res.data ?? null;
            set({ user: userData, loading: false, bootstrapped: true });
          } catch (e) {
            // token invalid, clear
            SecureTokenStorage.clearAllTokens();
            set({ isLoggedIn: false, role: null, user: null, loading: false, bootstrapped: true });
          }
        } else {
          set({ isLoggedIn: false, role: null, user: null, bootstrapped: true });
        }
      },

      login: async (accessToken, refreshToken, role, userPayload) => {
        const aOk = SecureTokenStorage.setAccessToken(accessToken);
        const rOk = SecureTokenStorage.setRefreshToken(refreshToken);
        const roleOk = SecureTokenStorage.setUserRole(role);
        if (!aOk || !rOk || !roleOk) {
          // do not update state if storage failed
          return;
        }
        if (userPayload) {
          set({ isLoggedIn: true, role, user: userPayload });
        } else {
          set({ isLoggedIn: true, role });
          await get().refreshUser();
        }
      },

      refreshUser: async () => {
        try {
          set({ loading: true });
          const res = await api.get("/auth/me");
          const userData = res.data?.user ?? res.data ?? null;
          set({ user: userData, loading: false });
        } catch (e) {
          // if fail, treat as logged out
          SecureTokenStorage.clearAllTokens();
          set({ isLoggedIn: false, role: null, user: null, loading: false });
        }
      },

      logout: () => {
        SecureTokenStorage.clearAllTokens();
        set({ ...initialState, isLoggedIn: false, bootstrapped: true });
        // emit storage event to mirror context behavior if needed by listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: "logout",
              newValue: Date.now().toString(),
              storageArea: localStorage,
            })
          );
        }
      },
    }),
    {
      name: "auth", // persisted key
      version: 1,
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        role: state.role,
        user: state.user, // keep small user cached; can be refreshed later
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
