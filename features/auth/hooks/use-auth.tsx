"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthenticationResultDto, AuthenticatedUserDto } from "@/lib/api";
import { clearSession, getSession, isAuthenticated, saveSession } from "@/lib/auth/auth-storage";

type AuthContextValue = {
  user: AuthenticatedUserDto | null;
  isAuthenticated: boolean;
  login: (result: AuthenticationResultDto) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUserDto | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    const authed = isAuthenticated();
    setUser(authed ? session?.user ?? null : null);
    setIsAuthed(authed);
    if (!authed) clearSession();
  }, []);

  const login = useCallback((result: AuthenticationResultDto) => {
    saveSession(result);
    setUser(result.user);
    setIsAuthed(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setIsAuthed(false);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: isAuthed,
      login,
      logout,
    }),
    [isAuthed, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
