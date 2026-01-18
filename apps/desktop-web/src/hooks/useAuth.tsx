"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse } from "@/services/auth.service";

type AuthContextValue = {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isRemembered: boolean;
  isReady: boolean;
  login: (session: AuthResponse, remember?: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthResponse["user"]>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "forotrix:auth";
const SESSION_KEY = "forotrix:auth:session";

type PersistedSession = Pick<AuthContextValue, "accessToken" | "refreshToken"> & {
  user: AuthResponse["user"] | null;
};

const emptySession: PersistedSession = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<PersistedSession>(emptySession);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersistedSession;
        setSession(parsed);
        setIsRemembered(Boolean(window.localStorage.getItem(STORAGE_KEY)));
      } catch {
        // ignore corrupted storage
      }
    }
    setIsReady(true);
  }, []);

  const persistSession = useCallback((next: PersistedSession, remember: boolean) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);

    const payload = JSON.stringify(next);
    if (remember) {
      window.localStorage.setItem(STORAGE_KEY, payload);
    } else {
      window.sessionStorage.setItem(SESSION_KEY, payload);
    }
    setIsRemembered(remember);
  }, []);

  const login = useCallback(
    (payload: AuthResponse, remember = false) => {
      const nextSession: PersistedSession = {
        user: payload.user,
        accessToken: payload.access,
        refreshToken: payload.refresh,
      };
      setSession(nextSession);
      persistSession(nextSession, remember);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    setSession(emptySession);
    setIsRemembered(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleExpired = () => {
      logout();
    };
    window.addEventListener("auth:expired", handleExpired as EventListener);
    return () => {
      window.removeEventListener("auth:expired", handleExpired as EventListener);
    };
  }, [logout]);

  const updateUser = useCallback(
    (updates: Partial<AuthResponse["user"]>) => {
      setSession((prev) => {
        if (!prev.user) return prev;
        const next: PersistedSession = {
          ...prev,
          user: { ...prev.user, ...updates },
        };
        persistSession(next, isRemembered);
        return next;
      });
    },
    [persistSession, isRemembered],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      isAuthenticated: Boolean(session.user && session.accessToken),
      isRemembered,
      isReady,
      login,
      logout,
      updateUser,
    }),
    [session, isRemembered, isReady, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
