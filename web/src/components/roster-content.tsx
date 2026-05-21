"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Briefcase } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { NormiePreviewCard } from "./normie-preview-card";
import { PillButtonLink } from "./pill-button";
import { cn } from "@/lib/utils";

type RosterNormie = {
  tokenId: number;
  pixels: string;
  jobTitle: string;
  oneLiner: string;
};

const pillInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-sm font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90",
);
const pillOuter = "inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function RosterContent() {
  const { status } = useAuth();
  const [data, setData] = useState<{ address: string; normies: RosterNormie[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setData(null);
      return;
    }

    setLoading(true);
    setError(false);
    fetch("/api/roster")
      .then(async (res) => {
        if (!res.ok) {
          setError(true);
          return;
        }
        setData(await res.json());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-lg space-y-6">
        <div className="space-y-3">
          <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
          <p className="text-base text-neutral-500">
            Sign in to see the normies your wallet currently holds.
          </p>
        </div>

        <div className="rounded-xl bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="space-y-3 rounded-[10px] bg-neutral-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <Briefcase size={20} className="text-neutral-300 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-neutral-500">your placements</p>
                <p className="text-sm text-neutral-400">
                  connect wallet and sign in to load your roster
                </p>
              </div>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal, openAccountModal, authenticationStatus, account, chain, mounted }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected = ready && account && chain && authenticationStatus === "authenticated";
                if (!ready) return null;
                return (
                  <div className={pillOuter}>
                    <button
                      onClick={connected ? openAccountModal : openConnectModal}
                      className={pillInner}
                    >
                      {connected ? account.displayName : "connect wallet"}
                    </button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
        <p className="text-sm text-neutral-400">loading your placements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
        <p className="text-sm text-neutral-500">couldn&apos;t load your roster. try again in a moment.</p>
      </div>
    );
  }

  if (!data || data.normies.length === 0) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="space-y-3">
          <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
          {data && (
            <p className="font-mono text-sm text-neutral-400">{shortAddr(data.address)}</p>
          )}
          <p className="text-base text-neutral-500">
            No normies on this wallet yet.
          </p>
        </div>
        <PillButtonLink href="/explore">Explore the Talented Normies</PillButtonLink>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
        <p className="font-mono text-sm text-neutral-400">{shortAddr(data.address)}</p>
        <p className="text-base text-neutral-500">
          {data.normies.length} placement{data.normies.length === 1 ? "" : "s"} on file.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {data.normies.map((n) => (
          <NormiePreviewCard
            key={n.tokenId}
            tokenId={n.tokenId}
            pixels={n.pixels}
            jobTitle={n.jobTitle}
            oneLiner={n.oneLiner}
          />
        ))}
      </div>
    </div>
  );
}
