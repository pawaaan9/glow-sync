"use client";

import { apiGet } from "@/lib/api/http";
import { auth } from "@/lib/firebase/client";
import type { MeResponse } from "@/lib/shared";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextValue {
  /** The raw Firebase Auth user, or null if signed out. Undefined while the initial auth check is in flight. */
  firebaseUser: User | null | undefined;
  /** The backend's view of the signed-in user (role, verificationStatus, salonId) and their salon, if any. */
  me: MeResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: UseQueryResult["refetch"];
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setFirebaseUser), []);

  const meQuery = useQuery({
    queryKey: ["auth", "me", firebaseUser?.uid],
    queryFn: () => apiGet<MeResponse>("/api/auth/me"),
    enabled: Boolean(firebaseUser),
    staleTime: 30 * 1000,
    retry: false,
  });

  const value: AuthContextValue = {
    firebaseUser,
    me: meQuery.data,
    isLoading: firebaseUser === undefined || (Boolean(firebaseUser) && meQuery.isLoading),
    isError: meQuery.isError,
    refetch: meQuery.refetch,
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
