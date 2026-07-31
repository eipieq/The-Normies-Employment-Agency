import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) throw new Error("NEXT_PUBLIC_WC_PROJECT_ID is not set in .env.local");

function rpcUrl() {
  if (process.env.NEXT_PUBLIC_MAINNET_RPC_URL) return process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    return `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  return "https://ethereum-rpc.publicnode.com";
}

export const wagmiConfig = getDefaultConfig({
  appName: "the employment agency",
  projectId,
  chains: [mainnet],
  transports: { [mainnet.id]: http(rpcUrl()) },
  ssr: true,
});
