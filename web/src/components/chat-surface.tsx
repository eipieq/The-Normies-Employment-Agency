"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { NormiePortrait } from "./normie-portrait";
import { PillButton } from "./pill-button";
import type { CollectionSlug, Portrait } from "@/lib/collections";
import type { StoredMessage } from "@/lib/chat-history";

type Props = {
  collection: CollectionSlug;
  label: string;
  tokenId: number;
  jobTitle: string;
  portrait: Portrait;
  initialHistory?: StoredMessage[];
};

function ChatPortrait({ portrait, alt }: { portrait: Portrait; alt: string }) {
  if (portrait.kind === "pixels") {
    return <NormiePortrait pixels={portrait.pixels} className="w-10 h-10 rounded-lg" />;
  }
  return (
    <Image
      src={portrait.src}
      alt={alt}
      width={40}
      height={40}
      className="w-10 h-10 rounded-lg object-cover"
      unoptimized
    />
  );
}

export function ChatSurface({ collection, label, tokenId, jobTitle, portrait, initialHistory = [] }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const seedMessages = initialHistory.map((m, i) => ({
    id: `h-${m.ts}-${i}`,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/collections/${collection}/works/chat/${tokenId}`,
    }),
    messages: seedMessages,
  });

  const busy = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-1 flex-col w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <Link
          href={`/collections/${collection}/works/${tokenId}`}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <ChatPortrait portrait={portrait} alt={`${label} #${tokenId}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate capitalize">{jobTitle}</p>
          <p className="text-sm text-neutral-400">
            {label} #{tokenId}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-[50vh]">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">
            say something. your {label} is on the clock.
          </p>
        )}
        {messages.length > 0 && initialHistory.length > 0 && messages.length === initialHistory.length && (
          <p className="text-sm text-neutral-300 text-center pb-4">— previous session —</p>
        )}
        {messages.map((m) => {
          const text = m.parts.filter(isTextUIPart).map((p) => p.text).join("");
          if (!text) return null;
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}
        {error && (
          <p className="text-sm text-red-500 text-center">something went wrong. try again.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="px-4 py-3 border-t border-neutral-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`message your ${label}...`}
          className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary"
          disabled={busy}
        />
        <PillButton type="submit" disabled={busy || !input.trim()}>
          <PaperPlaneTilt size={16} weight="regular" />
        </PillButton>
      </form>
    </div>
  );
}
