import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) throw new Error("NEXT_PUBLIC_WC_PROJECT_ID is not set in .env.local");

export const wagmiConfig = getDefaultConfig({
  appName: "normie employment agency",
  projectId,
  chains: [mainnet],
  ssr: true,
});
