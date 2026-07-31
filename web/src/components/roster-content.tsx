"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Briefcase } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { NormiePreviewCard } from "./normie-preview-card";
import { PillButtonLink } from "./pill-button";
import { cn } from "@/lib/utils";
import type { Portrait, CollectionSlug } from "@/lib/collections";

type RosterItem = {
  tokenId: number;
  portrait: Portrait;
  jobTitle: string;
  oneLiner: string;
};

type NormiesData = { address: string; normies: Array<{ tokenId: number; pixels: string; jobTitle: string; oneLiner: string }> };
type AzukiData = { address: string; items: RosterItem[] };

const pillInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-sm font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90",
);
const pillOuter = "inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const COLLECTIONS: { slug: CollectionSlug; label: string }[] = [
  { slug: "normies", label: "normies" },
  { slug: "azuki", label: "azuki" },
];

export function RosterContent() {
  const { status } = useAuth();
  const [active, setActive] = useState<CollectionSlug>("normies");
  const [normiesData, setNormiesData] = useState<NormiesData | null>(null);
  const [azukiData, setAzukiData] = useState<AzukiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setNormiesData(null);
      setAzukiData(null);
      return;
    }

    const endpoint = active === "normies" ? "/api/roster" : "/api/roster/azuki";
    const alreadyLoaded = active === "normies" ? normiesData : azukiData;
    if (alreadyLoaded) return;

    setLoading(true);
    setError(false);
    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) { setError(true); return; }
        const json = await res.json();
        if (active === "normies") setNormiesData(json);
        else setAzukiData(json);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // intentionally excluding normiesData/azukiData from deps — we only load once per collection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, active]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-lg space-y-6">
        <div className="space-y-3">
          <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
          <p className="text-base text-neutral-500">
            Sign in to see the tokens your wallet currently holds.
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

  const address = normiesData?.address ?? azukiData?.address ?? "";

  const currentItems: RosterItem[] =
    active === "normies"
      ? (normiesData?.normies ?? []).map((n) => ({
          tokenId: n.tokenId,
          portrait: { kind: "pixels" as const, pixels: n.pixels },
          jobTitle: n.jobTitle,
          oneLiner: n.oneLiner,
        }))
      : (azukiData?.items ?? []);

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Your Roster</h1>
        {address && <p className="font-mono text-sm text-neutral-400">{shortAddr(address)}</p>}
      </div>

      {/* collection tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        {COLLECTIONS.map(({ slug, label }) => (
          <button
            key={slug}
            onClick={() => { setError(false); setActive(slug); }}
            className={cn(
              "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
              active === slug
                ? "border-b-2 border-neutral-900 text-neutral-900 -mb-px"
                : "text-neutral-400 hover:text-neutral-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-neutral-400">loading your placements...</p>
      )}

      {error && (
        <p className="text-sm text-neutral-500">couldn&apos;t load your roster. try again in a moment.</p>
      )}

      {!loading && !error && currentItems.length === 0 && (
        <div className="space-y-4">
          <p className="text-base text-neutral-500">
            No {active} on this wallet.
          </p>
          <PillButtonLink href="/explore">Explore the Talented {active === "normies" ? "Normies" : "Azukis"}</PillButtonLink>
        </div>
      )}

      {!loading && !error && currentItems.length > 0 && (
        <>
          <p className="text-base text-neutral-500">
            {currentItems.length} placement{currentItems.length === 1 ? "" : "s"} on file.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {currentItems.map((item) => (
              <NormiePreviewCard
                key={item.tokenId}
                collection={active}
                tokenId={item.tokenId}
                portrait={item.portrait}
                jobTitle={item.jobTitle}
                oneLiner={item.oneLiner}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
