"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const pillInner = cn(
  "inline-flex h-[28px] cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-primary px-2.5 text-[13px] font-medium text-primary-foreground tracking-tight transition-all",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
  "hover:bg-primary/90"
);

const pillOuter = "inline-flex h-[34px] items-center rounded-md border border-black/10 bg-card p-[2px]";

export function Header() {
  return (
    <header className="border-b border-neutral-100 px-4 h-12 flex items-center justify-between">
      <Link href="/" className="flex items-center opacity-80 hover:opacity-100 transition-opacity">
        <Image
          src="/agency-wordmark.svg"
          alt="the normie employment agency"
          width={140}
          height={30}
          className="h-[18px] w-auto"
          priority
        />
      </Link>

      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected = ready && account && chain && authenticationStatus === "authenticated";

          if (!ready) return <div className={pillOuter} style={{ opacity: 0, pointerEvents: "none" }} aria-hidden />;

          if (!connected) {
            return (
              <div className={pillOuter}>
                <button onClick={openConnectModal} className={pillInner}>
                  connect wallet
                </button>
              </div>
            );
          }

          if (chain.unsupported) {
            return (
              <div className={pillOuter}>
                <button onClick={openChainModal} className={cn(pillInner, "bg-red-500 hover:bg-red-500/90")}>
                  wrong network
                </button>
              </div>
            );
          }

          return (
            <div className={pillOuter}>
              <button onClick={openAccountModal} className={pillInner}>
                {account.displayName}
              </button>
            </div>
          );
        }}
      </ConnectButton.Custom>
    </header>
  );
}
