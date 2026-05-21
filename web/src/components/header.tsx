"use client";

import Link from "next/link";
import { CustomConnectButton } from "@/components/connect-button";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { status } = useAuth();

  return (
    <header className="border-b border-neutral-100 bg-white px-8 py-3 flex items-center justify-between">
      <Link
        href="/"
        className="text-neutral-900 hover:text-neutral-700 transition-colors"
        style={{ fontFamily: "var(--font-instrument-sans)", fontWeight: 500, fontSize: "18px", letterSpacing: "-0.01em", lineHeight: 1 }}
      >
        The Normies<br />Employment Agency
      </Link>

      <div className="flex items-center gap-4">
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
