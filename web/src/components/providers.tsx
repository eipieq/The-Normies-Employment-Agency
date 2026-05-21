"use client";

import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSiweMessage } from "viem/siwe";
import { wagmiConfig } from "@/lib/wagmi";
import { useState, useEffect, useCallback } from "react";
import { AuthContext, type AuthStatus } from "@/lib/auth-context";

import "@rainbow-me/rainbowkit/styles.css";

// module-level callback so the auth adapter can trigger a status refresh after verify/signOut.
let onAuthChange: (() => void) | null = null;

const authAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const res = await fetch("/api/auth/nonce");
    return res.text();
  },

  createMessage: ({ nonce, address, chainId }) =>
    createSiweMessage({
      domain: window.location.host,
      address,
      statement: "sign in to the normies employment agency.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    }),

  verify: async ({ message, signature }) => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });
    if (res.ok) onAuthChange?.();
    return res.ok;
  },

  signOut: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    onAuthChange?.();
  },
});

const theme = lightTheme({
  accentColor: "#a5b4fc", // indigo-300
  accentColorForeground: "#1e1b4b",
  borderRadius: "medium",
  fontStack: "system",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authAddress, setAuthAddress] = useState<string | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        setAuthStatus(d.authenticated ? "authenticated" : "unauthenticated");
        setAuthAddress(d.address ?? null);
      })
      .catch(() => setAuthStatus("unauthenticated"));
  }, []);

  useEffect(() => {
    fetchStatus();
    onAuthChange = fetchStatus;
    return () => { onAuthChange = null; };
  }, [fetchStatus]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
          <RainbowKitProvider theme={theme}>
            <AuthContext.Provider value={{ status: authStatus, address: authAddress, refresh: fetchStatus }}>
              {children}
            </AuthContext.Provider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
