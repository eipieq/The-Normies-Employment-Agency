"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Copy, Check, ChatCircle, CreditCard, Spinner, ArrowSquareOut } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { PillButtonLink } from "@/components/pill-button";
import { DecisionLog } from "@/components/decision-log";
import type { CollectionSlug } from "@/lib/collections";

const pillInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-sm font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90",
);
const pillOuter = "inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]";

type GatedData = {
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  systemPrompt: string;
};

type Status = "idle" | "loading" | "not-owner" | "subscribe" | "ready" | "error";

export function GatedPanel({
  collection,
  tokenId,
  label,
}: {
  collection: CollectionSlug;
  tokenId: number;
  label: string;
}) {
  const { status: authStatus } = useAuth();
  const [data, setData] = useState<GatedData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // dev-only: ?preview=subscribe|not-owner|ready|error to force a state
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const preview = new URLSearchParams(window.location.search).get("preview") as Status | null;
    if (preview) setStatus(preview);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" &&
        new URLSearchParams(window.location.search).get("preview")) return;
    if (authStatus !== "authenticated") {
      setData(null);
      setStatus((s) => s === "subscribe" ? s : "idle");
      return;
    }
    setStatus("loading");
    fetch(`/api/collections/${collection}/works/persona/${tokenId}`)
      .then(async (res) => {
        if (res.status === 403) {
          setStatus("not-owner");
          return;
        }
        if (res.status === 402) {
          setStatus("subscribe");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        setData(await res.json());
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [authStatus, collection, tokenId]);

  function copyPrompt() {
    if (!data) return;
    navigator.clipboard.writeText(data.systemPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function openCheckout() {
    setSubscribing(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/subscriptions/checkout", { method: "POST" });
      if (res.status === 401) {
        setCheckoutError("connect your wallet first to subscribe.");
        setSubscribing(false);
        return;
      }
      if (!res.ok) {
        setCheckoutError("something went wrong. try again.");
        setSubscribing(false);
        return;
      }
      const { paymentUrl } = (await res.json()) as { paymentUrl: string };
      window.location.href = paymentUrl;
    } catch {
      setCheckoutError("something went wrong. try again.");
      setSubscribing(false);
    }
  }

  if (status === "subscribe") {
    return (
      <div className="rounded-[5px] bg-neutral-50 p-3.5 space-y-3">
        <div className="flex items-start gap-2.5">
          <CreditCard size={16} className="text-neutral-300 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-neutral-500">holder pass required</p>
            <p className="text-sm text-neutral-400">
              unlock work style · strengths · system prompt · chat · decisions for all your tokens.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={pillOuter}>
            <button
              onClick={openCheckout}
              disabled={subscribing}
              className={pillInner}
            >
              {subscribing
                ? <Spinner size={14} className="animate-spin" />
                : <ArrowSquareOut size={14} />}
              {subscribing ? "redirecting..." : "subscribe · $14.99 / month"}
            </button>
          </div>
        </div>
        {checkoutError && (
          <p className="text-[11px] text-red-400">{checkoutError}</p>
        )}
        <p className="text-[11px] text-neutral-400">
          pay in any crypto via NOWPayments. access activates within minutes of payment.
        </p>
      </div>
    );
  }

  if (authStatus === "loading" || authStatus === "unauthenticated" || status === "idle") {
    return (
      <div className="rounded-[5px] bg-neutral-50 p-3.5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock size={16} className="text-neutral-300 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-neutral-500">
              work style · strengths · system prompt
            </p>
            <p className="text-sm text-neutral-400">
              connect wallet to verify ownership and unlock
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
                <button onClick={connected ? openAccountModal : openConnectModal} className={pillInner}>
                  {connected ? account.displayName : "connect wallet"}
                </button>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="rounded-[5px] bg-neutral-50 p-3.5">
        <p className="text-sm text-neutral-400">verifying ownership...</p>
      </div>
    );
  }

  if (status === "not-owner") {
    return (
      <div className="rounded-[5px] bg-neutral-50 p-3.5 flex items-start gap-2.5">
        <Lock size={16} className="text-neutral-300 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-neutral-500">not your {label}</p>
          <p className="text-sm text-neutral-400">this token belongs to a different wallet.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-[5px] bg-neutral-50 p-3.5">
        <p className="text-sm text-neutral-400">something went wrong. try refreshing.</p>
      </div>
    );
  }

  if (status === "ready" && data) {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">work style</p>
          <p className="text-sm text-neutral-600 leading-relaxed">{data.workStyle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">strengths</p>
            <ul className="space-y-1">
              {data.strengths.map((s) => (
                <li key={s} className="text-sm text-neutral-500 leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">blind spots</p>
            <ul className="space-y-1">
              {data.blindSpots.map((s) => (
                <li key={s} className="text-sm text-neutral-500 leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">system prompt</p>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-lg p-2.5 border border-neutral-100 max-h-40 sm:max-h-64 overflow-y-auto">
            {data.systemPrompt}
          </p>
        </div>

        <div className="flex justify-center pt-1">
          <PillButtonLink href={`/collections/${collection}/works/${tokenId}/chat`}>
            <ChatCircle size={16} weight="regular" />
            meet your coworker
          </PillButtonLink>
        </div>

        <div className="border-t border-neutral-100 pt-3">
          <DecisionLog collection={collection} tokenId={tokenId} />
        </div>
      </div>
    );
  }

  return null;
}
