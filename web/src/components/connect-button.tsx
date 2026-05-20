"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

const outer = "inline-flex items-center rounded-md border border-black/10 bg-card p-[2px]";

const inner = (extra?: string) =>
  cn(
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 py-0.5 text-[14px] font-medium tracking-tight transition-all",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.1)]",
    extra
  );

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected = ready && account && chain && authenticationStatus === "authenticated";

        if (!ready) return <div className={outer} style={{ opacity: 0, pointerEvents: "none" }} aria-hidden />;

        if (!connected) {
          return (
            <div className={outer}>
              <button onClick={openConnectModal} className={inner("bg-primary text-primary-foreground hover:bg-primary/90")}>
                Connect Wallet
              </button>
            </div>
          );
        }

        if (chain.unsupported) {
          return (
            <div className={outer}>
              <button onClick={openChainModal} className={inner("bg-red-500 text-white hover:bg-red-500/90")}>
                Wrong Network
              </button>
            </div>
          );
        }

        return (
          <div className={outer}>
            <button onClick={openAccountModal} className={inner("bg-neutral-100 text-neutral-700 hover:bg-neutral-200")}>
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function SignOutButton() {
  return (
    <ConnectButton.Custom>
      {({ openAccountModal, mounted }) => {
        if (!mounted) return null;
        return (
          <div className={outer}>
            <button
              onClick={openAccountModal}
              className={inner("bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}
            >
              Disconnect
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
