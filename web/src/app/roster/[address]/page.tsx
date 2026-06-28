import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isAddress } from "viem";
import { normies, NormiesApiError } from "@/lib/normies";
import { PublicRosterGrid } from "@/components/public-roster-grid";

type Props = { params: Promise<{ address: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  if (!isAddress(address)) return { title: "not found" };
  return {
    title: `Roster — ${address.slice(0, 6)}...${address.slice(-4)}`,
    description: "Normies held by this wallet.",
  };
}

export default async function PublicRosterPage({ params }: Props) {
  const { address: raw } = await params;
  if (!isAddress(raw)) notFound();

  const address = raw.toLowerCase();

  let holdings;
  try {
    holdings = await normies.holdings(address);
  } catch (e) {
    if (e instanceof NormiesApiError && e.status >= 400 && e.status < 500) notFound();
    throw e;
  }

  const tokenIds = holdings.tokenIds.map(Number).sort((a, b) => a - b);

  return (
    <main className="flex flex-1 flex-col px-6 py-12 pb-24">
      <div className="max-w-4xl mx-auto w-full">
        <PublicRosterGrid address={address} tokenIds={tokenIds} />
      </div>
    </main>
  );
}
