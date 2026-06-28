"use client";

import Link from "next/link";
import { CustomConnectButton } from "@/components/connect-button";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { status } = useAuth();

  return (
    <header className="border-b border-neutral-100 bg-white px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
      <Link
        href="/"
        className="text-neutral-900 hover:text-neutral-700 transition-colors shrink min-w-0 text-[15px] sm:text-[18px]"
        style={{
          fontFamily: "var(--font-instrument-sans)",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1,
        }}
      >
        <span className="sm:hidden">Employment<br />Agency</span>
        <span className="hidden sm:inline">The Employment<br />Agency</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {status === "authenticated" && (
          <Link
            href="/roster"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Roster
          </Link>
        )}
        <CustomConnectButton />
      </div>
    </header>
  );
}
