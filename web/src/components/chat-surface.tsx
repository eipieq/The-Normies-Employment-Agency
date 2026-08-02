"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { ArrowLeft, Lock, PaperPlaneTilt } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import { NormiePortrait } from "./normie-portrait";
import { PillButton, PillButtonLink } from "./pill-button";
import type { CollectionSlug, Portrait } from "@/lib/collections";
import type { StoredMessage } from "@/lib/chat-history";

type DisabledInfo = { message: string; ctaHref: string; ctaLabel: string };

type Props = {
  collection: CollectionSlug;
  label: string;
  tokenId: number;
  jobTitle: string;
  portrait: Portrait;
  initialHistory?: StoredMessage[];
  disabled?: DisabledInfo | null;
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

export function ChatSurface({ collection, label, tokenId, jobTitle, portrait, initialHistory = [], disabled = null }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const busy = status === "streaming" || status === "submitted" || !!disabled;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0">
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

      {disabled && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center gap-2 min-w-0">
            <Lock size={16} className="text-neutral-300 shrink-0" />
            <p className="text-sm text-neutral-500 truncate">{disabled.message}</p>
          </div>
          <PillButtonLink href={disabled.ctaHref} variant="secondary" className="shrink-0">
            {disabled.ctaLabel}
          </PillButtonLink>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-4 py-6 space-y-4">
        {messages.length === 0 && !disabled && (
          <p className="text-sm text-neutral-400 text-center py-8">
            say something. your {label} is on the clock.
          </p>
        )}
        {messages.length === 0 && disabled && (
          <p className="text-sm text-neutral-400 text-center py-8">
            no messages yet with this {label}.
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
                {isUser ? text : (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children }) => <code className="bg-neutral-200 rounded px-1 font-mono text-xs">{children}</code>,
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}
        {error && (
          <p className="text-sm text-red-500 text-center">something went wrong. try again.</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="shrink-0 px-4 py-3 border-t border-neutral-100 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? disabled.message : `message your ${label}...`}
          className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary disabled:text-neutral-400"
          disabled={busy}
        />
        <PillButton type="submit" disabled={busy || !input.trim()}>
          <PaperPlaneTilt size={16} weight="regular" />
        </PillButton>
      </form>
    </div>
  );
}
