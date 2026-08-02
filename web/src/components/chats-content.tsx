"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChatCircleDots } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { NormiePortrait } from "./normie-portrait";
import { PillButtonLink } from "./pill-button";
import { cn } from "@/lib/utils";
import type { CollectionSlug, Portrait } from "@/lib/collections";

type ChatItem = {
  collection: CollectionSlug;
  tokenId: number;
  label: string;
  portrait: Portrait;
  jobTitle: string;
  lastMessage: string;
  lastActive: number;
};

const pillInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-sm font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90",
);
const pillOuter = "inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]";

function timeAgo(ts: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function ChatPortrait({ portrait, alt }: { portrait: Portrait; alt: string }) {
  if (portrait.kind === "pixels") {
    return <NormiePortrait pixels={portrait.pixels} className="w-11 h-11 rounded-lg shrink-0" />;
  }
  return (
    <Image
      src={portrait.src}
      alt={alt}
      width={44}
      height={44}
      className="w-11 h-11 rounded-lg object-cover shrink-0"
      unoptimized
    />
  );
}

export function ChatsContent() {
  const { status } = useAuth();
  const [chats, setChats] = useState<ChatItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setChats(null);
      return;
    }

    setLoading(true);
    setError(false);
    fetch("/api/chats")
      .then(async (res) => {
        if (!res.ok) { setError(true); return; }
        const json = await res.json();
        setChats(json.chats);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="max-w-lg space-y-6">
        <div className="space-y-3">
          <h1 className="font-pixel-square text-3xl text-neutral-900">Your Chats</h1>
          <p className="text-base text-neutral-500">
            Sign in to see every conversation you&apos;ve had with your coworkers.
          </p>
        </div>

        <div className="rounded-xl bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="space-y-3 rounded-[10px] bg-neutral-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <ChatCircleDots size={20} className="text-neutral-300 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-neutral-500">your conversations</p>
                <p className="text-sm text-neutral-400">
                  connect wallet and sign in to load your chats
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

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="font-pixel-square text-3xl text-neutral-900">Your Chats</h1>
        <p className="text-base text-neutral-500">every conversation you&apos;ve had with a coworker.</p>
      </div>

      {loading && (
        <p className="text-sm text-neutral-400">loading your chats...</p>
      )}

      {error && (
        <p className="text-sm text-neutral-500">couldn&apos;t load your chats. try again in a moment.</p>
      )}

      {!loading && !error && chats?.length === 0 && (
        <div className="space-y-4">
          <p className="text-base text-neutral-500">
            No conversations yet. go meet a coworker.
          </p>
          <PillButtonLink href="/roster">View Your Roster</PillButtonLink>
        </div>
      )}

      {!loading && !error && chats && chats.length > 0 && (
        <div className="rounded-xl bg-white p-1 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="divide-y divide-neutral-100 rounded-[10px] bg-neutral-50 overflow-hidden">
            {chats.map((chat) => (
              <Link
                key={`${chat.collection}-${chat.tokenId}`}
                href={`/collections/${chat.collection}/works/${chat.tokenId}/chat`}
                className="flex items-center gap-3 px-3.5 py-3 hover:bg-neutral-100 transition-colors"
              >
                <ChatPortrait portrait={chat.portrait} alt={`${chat.label} #${chat.tokenId}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900 truncate capitalize">{chat.jobTitle}</p>
                    <p className="text-sm text-neutral-400 shrink-0">{timeAgo(chat.lastActive)}</p>
                  </div>
                  <p className="text-sm text-neutral-400 truncate">
                    {chat.label} #{chat.tokenId}
                    {chat.lastMessage && <span className="text-neutral-300"> · {chat.lastMessage}</span>}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
