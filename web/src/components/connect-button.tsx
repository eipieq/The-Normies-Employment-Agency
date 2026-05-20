"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, SignIn, SignOut, WarningCircle } from "@phosphor-icons/react";

// custom connect button that matches the design guide.
// delegates wallet selection + signing to rainbowkit's modal, just skins the trigger.
export function CustomConnectButton({ size = "default" }: { size?: "default" | "sm" }) {
  const isSmall = size === "sm";
  const cls = isSmall
    ? "inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors cursor-pointer"
    : "inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors cursor-pointer";

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected = ready && account && chain && authenticationStatus === "authenticated";

        if (!ready) return <div className={cls} style={{ opacity: 0, pointerEvents: "none" }} aria-hidden />;

        if (!connected) {
          return (
            <button onClick={openConnectModal} className={cls}>
              <Wallet size={isSmall ? 12 : 14} />
              connect wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button onClick={openChainModal} className={cls + " border-red-200 text-red-500 hover:border-red-300 hover:text-red-600"}>
              <WarningCircle size={isSmall ? 12 : 14} />
              wrong network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button onClick={openAccountModal} className={cls}>
              <SignIn size={isSmall ? 12 : 14} className="text-indigo-300" />
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

// sign-out button used elsewhere
export function SignOutButton() {
  return (
    <ConnectButton.Custom>
      {({ openAccountModal, mounted }) => {
        if (!mounted) return null;
        return (
          <button
            onClick={openAccountModal}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <SignOut size={12} />
            disconnect
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
