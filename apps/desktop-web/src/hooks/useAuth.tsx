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
import { refreshSession } from "@/services/httpClient";
import { authorizedRequest } from "@/services/apiClient";

type AuthContextValue = {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
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

type PersistedSession = Pick<AuthContextValue, "accessToken"> & {
  user: AuthResponse["user"] | null;
};

const emptySession: PersistedSession = {
  user: null,
  accessToken: null,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<PersistedSession>(emptySession);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isReady, setIsReady] = useState(false);

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

  // The refresh token lives in an httpOnly cookie now, never in JS-readable
  // storage - so on load, instead of reading a persisted token, we ask the
  // API to silently refresh using that cookie. Any leftover pre-migration
  // localStorage/sessionStorage entries (which could still contain an old
  // plaintext refresh token) are purged either way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      const refreshed = await refreshSession();
      if (cancelled) return;

      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);

      if (refreshed?.accessToken) {
        const nextSession: PersistedSession = {
          user: (refreshed.user as AuthResponse["user"]) ?? null,
          accessToken: refreshed.accessToken,
        };
        setSession(nextSession);
        persistSession(nextSession, true);
      } else {
        setSession(emptySession);
      }
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [persistSession]);

  const login = useCallback(
    (payload: AuthResponse, remember = false) => {
      const nextSession: PersistedSession = {
        user: payload.user,
        accessToken: payload.access,
      };
      setSession(nextSession);
      persistSession(nextSession, remember);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    const currentAccessToken = session.accessToken;
    setSession(emptySession);
    setIsRemembered(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    if (currentAccessToken) {
      authorizedRequest("/auth/logout", currentAccessToken, { method: "POST" }).catch(() => {
        // best-effort - local state is already cleared either way
      });
    }
  }, [session.accessToken]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleRefresh = (event: Event) => {
      const detail = (event as CustomEvent<{ user: unknown; accessToken: string }>).detail;
      if (!detail?.accessToken) return;
      const nextSession: PersistedSession = {
        user: (detail.user as AuthResponse["user"]) ?? session.user,
        accessToken: detail.accessToken,
      };
      setSession(nextSession);
      persistSession(nextSession, isRemembered);
    };
    window.addEventListener("auth:refresh", handleRefresh as EventListener);
    return () => {
      window.removeEventListener("auth:refresh", handleRefresh as EventListener);
    };
  }, [persistSession, isRemembered, session.user]);

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
