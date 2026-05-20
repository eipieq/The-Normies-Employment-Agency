"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Copy, Check } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";

type GatedData = {
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  systemPrompt: string;
};

type Status = "idle" | "loading" | "not-owner" | "ready" | "error";

export function GatedPanel({ tokenId }: { tokenId: number }) {
  const { status: authStatus } = useAuth();
  const [data, setData] = useState<GatedData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setData(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    fetch(`/api/works/persona/${tokenId}`)
      .then(async (res) => {
        if (res.status === 403) { setStatus("not-owner"); return; }
        if (!res.ok) { setStatus("error"); return; }
        setData(await res.json());
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [authStatus, tokenId]);

  function copyPrompt() {
    if (!data) return;
    navigator.clipboard.writeText(data.systemPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // unauthenticated: show connect/sign button
  if (authStatus === "loading" || authStatus === "unauthenticated" || status === "idle") {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3.5 space-y-3">
        <div className="flex items-start gap-2.5">
          <Lock size={16} className="text-neutral-300 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-neutral-500">
              work style · strengths · system prompt
            </p>
            <p className="text-[11px] text-neutral-400">
              connect wallet to verify ownership and unlock
            </p>
          </div>
        </div>
        <ConnectButton
          accountStatus="address"
          chainStatus="none"
          showBalance={false}
        />
      </div>
    );
  }

  // connected + loading
  if (status === "loading") {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3.5">
        <p className="text-xs text-neutral-400">verifying ownership...</p>
      </div>
    );
  }

  // connected but not the owner
  if (status === "not-owner") {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3.5 flex items-start gap-2.5">
        <Lock size={16} className="text-neutral-300 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-neutral-500">not your normie</p>
          <p className="text-[11px] text-neutral-400">
            this normie belongs to a different wallet.
          </p>
        </div>
      </div>
    );
  }

  // error
  if (status === "error") {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3.5">
        <p className="text-xs text-neutral-400">something went wrong. try refreshing.</p>
      </div>
    );
  }

  // unlocked
  if (status === "ready" && data) {
    return (
      <div className="space-y-3">
        {/* work style */}
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
            work style
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">{data.workStyle}</p>
        </div>

        {/* strengths + blind spots */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              strengths
            </p>
            <ul className="space-y-1">
              {data.strengths.map((s) => (
                <li key={s} className="text-[11px] text-neutral-500 leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              blind spots
            </p>
            <ul className="space-y-1">
              {data.blindSpots.map((s) => (
                <li key={s} className="text-[11px] text-neutral-500 leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* system prompt */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
              system prompt
            </p>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed whitespace-pre-wrap bg-neutral-50 rounded-lg p-2.5 border border-neutral-100 max-h-40 overflow-y-auto">
            {data.systemPrompt}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
