"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart } from "ai";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react";
import { NormiePortrait } from "./normie-portrait";
import { PillButton } from "./pill-button";

type Props = {
  tokenId: number;
  jobTitle: string;
  pixels: string;
};

export function ChatSurface({ tokenId, jobTitle, pixels }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/works/chat/${tokenId}` }),
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
    <div className="flex h-[calc(100dvh-5rem)] w-full max-w-lg flex-col rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1">
      {/* header */}
      <div className="flex items-center gap-3 rounded-t-[10px] bg-neutral-100 p-3.5">
        <Link
          href={`/works/${tokenId}`}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="back to employment card"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white">
          <NormiePortrait pixels={pixels} className="block h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm text-neutral-400 tabular-nums">
            #{String(tokenId).padStart(4, "0")}
          </p>
          <h1 className="truncate font-pixel-square text-lg text-neutral-900 capitalize">
            {jobTitle}
          </h1>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-3.5">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400 text-center pt-8">
            say something. they&apos;re on the clock.
          </p>
        )}

        {messages.map((m) => {
          const text = m.parts.filter(isTextUIPart).map((p) => p.text).join("");
          if (!text) return null;
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  isUser
                    ? "max-w-[85%] rounded-xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground leading-relaxed"
                    : "max-w-[85%] rounded-xl bg-white px-3.5 py-2.5 text-sm text-neutral-700 leading-relaxed shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                }
              >
                {text}
              </div>
            </div>
          );
        })}

        {busy && messages.at(-1)?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-white px-3.5 py-2.5 text-sm text-neutral-400 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              typing...
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error.message.includes("429") ? "rate limit hit. try again later." : "something broke."}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-b-[10px] border-t border-neutral-100 bg-white p-3.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="message your coworker..."
          disabled={busy}
          className="flex-1 rounded-md border border-black/10 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary/40 disabled:opacity-50"
        />
        <PillButton type="submit" disabled={busy || !input.trim()}>
          <PaperPlaneTilt size={16} weight="regular" />
        </PillButton>
      </form>
    </div>
  );
}
