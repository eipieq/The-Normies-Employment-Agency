import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// NEXT_PUBLIC_* is inlined at build time, so a missing value used to throw here
// during `next build` while prerendering static pages (/_not-found, /error) that
// never touch a wallet — taking the whole build down. degrade instead: let the
// build finish, and complain loudly in the browser where it actually matters.
if (!projectId && typeof window !== "undefined") {
  console.error(
    "[agency] NEXT_PUBLIC_WC_PROJECT_ID is not set — walletconnect will not work. " +
      "note: it must be a plain (non-sensitive) env var, since build-time inlining cannot read sensitive ones.",
  );
}

const FALLBACK_PROJECT_ID = "00000000000000000000000000000000";

function rpcUrl() {
  if (process.env.NEXT_PUBLIC_MAINNET_RPC_URL) return process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    return `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  return "https://ethereum-rpc.publicnode.com";
}

export const wagmiConfig = getDefaultConfig({
  appName: "the employment agency",
  projectId: projectId || FALLBACK_PROJECT_ID,
  chains: [mainnet],
  transports: { [mainnet.id]: http(rpcUrl()) },
  ssr: true,
});
