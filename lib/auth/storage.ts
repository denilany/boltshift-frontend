import type { AuthSession } from "@/lib/auth/types";

export const AUTH_SESSION_STORAGE_KEY = "boltshift.auth.session";
export const AUTH_SESSION_EVENT = "boltshift:auth-session-changed";

function getWindowStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function readStoredSession(): AuthSession | null {
  const storage = getWindowStorage();

  if (!storage) {
    return null;
  }

  const raw = storage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null) {
  const storage = getWindowStorage();

  if (!storage) {
    return;
  }

  if (!session) {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } else {
    storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getStoredRefreshToken() {
  return readStoredSession()?.refreshToken ?? null;
}

