"use client";

import { createContext, useContext } from "react";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

type AuthCtx = {
  status: AuthStatus;
  address: string | null;
  refresh: () => void;
};

export const AuthContext = createContext<AuthCtx>({
  status: "loading",
  address: null,
  refresh: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
