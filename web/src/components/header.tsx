"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-neutral-100 px-4 h-12 flex items-center justify-between">
      <Link
        href="/"
        className="text-xs text-neutral-400 tracking-wide hover:text-neutral-600 transition-colors"
      >
        normie employment agency
      </Link>
      <ConnectButton
        accountStatus="address"
        chainStatus="none"
        showBalance={false}
      />
    </header>
  );
}
