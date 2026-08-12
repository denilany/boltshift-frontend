"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser, logoutAccount } from "@/lib/auth/client";
import { AUTH_SESSION_EVENT, readStoredSession, writeStoredSession } from "@/lib/auth/storage";
import type { AuthSession, AuthUser } from "@/lib/auth/types";

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signIn: (session: AuthSession) => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncFromStorage = () => {
      setSession(readStoredSession());
    };

    syncFromStorage();
    setIsReady(true);

    const handleAuthSessionChange = () => {
      syncFromStorage();
    };

    window.addEventListener(AUTH_SESSION_EVENT, handleAuthSessionChange);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handleAuthSessionChange);
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const hydrateUser = async () => {
      try {
        const user = await getCurrentUser();

        if (cancelled) {
          return;
        }

        if (user) {
          writeStoredSession({
            ...session,
            user,
          });
        }
      } catch {
        if (!cancelled) {
          await logoutAccount();
        }
      }
    };

    void hydrateUser();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken && session?.refreshToken),
      isReady,
      signIn: (nextSession) => {
        writeStoredSession(nextSession);
        setSession(nextSession);
      },
      signOut: async () => {
        await logoutAccount();
        setSession(null);
      },
      refreshUser: async () => {
        const user = await getCurrentUser();
        const currentSession = readStoredSession();

        if (currentSession && user) {
          writeStoredSession({
            ...currentSession,
            user,
          });
          setSession({
            ...currentSession,
            user,
          });
        }
      },
    }),
    [session, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

