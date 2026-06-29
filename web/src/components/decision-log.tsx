"use client";

import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { Spinner, ArrowSquareOut, Seal } from "@phosphor-icons/react";
import type { CollectionSlug } from "@/lib/collections/types";
import type { StoredDecision } from "@/lib/decisions";

// EAS on Base mainnet
const EAS_CONTRACT = process.env.NEXT_PUBLIC_EAS_CONTRACT ?? "0x4200000000000000000000000000000000000021";
const SCHEMA_UID = process.env.NEXT_PUBLIC_EAS_SCHEMA_UID ?? "";
// schema: uint256 tokenId, string collection, bytes32 decisionHash

const EASCAN_BASE = "https://base.easscan.org/attestation/view";

type Props = { collection: CollectionSlug; tokenId: number };

export function DecisionLog({ collection, tokenId }: Props) {
  const { data: walletClient } = useWalletClient();
  const [decisions, setDecisions] = useState<StoredDecision[]>([]);
  const [generating, setGenerating] = useState(false);
  const [attesting, setAttesting] = useState<string | null>(null); // hash being attested
  const [error, setError] = useState<string | null>(null);

  const apiBase = `/api/collections/${collection}/works/decisions/${tokenId}`;

  useEffect(() => {
    fetch(apiBase)
      .then((r) => r.ok ? r.json() : [])
      .then(setDecisions)
      .catch(() => {});
  }, [apiBase]);

  async function makeDecision() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(apiBase, { method: "POST" });
      if (!res.ok) { setError("failed to generate. try again."); return; }
      const decision: StoredDecision = await res.json();
      setDecisions((prev) => [decision, ...prev].slice(0, 20));
    } catch {
      setError("something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  async function attest(decision: StoredDecision) {
    if (!walletClient || !SCHEMA_UID) {
      setError("wallet not connected or schema uid not configured.");
      return;
    }
    setAttesting(decision.hash);
    setError(null);
    try {
      const eas = new EAS(EAS_CONTRACT);
      // EAS SDK expects an ethers signer — wrap wagmi walletClient
      const { BrowserProvider } = await import("ethers");
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      await eas.connect(signer);

      const encoder = new SchemaEncoder("uint256 tokenId,string collection,bytes32 decisionHash");
      const encoded = encoder.encodeData([
        { name: "tokenId", value: BigInt(decision.tokenId), type: "uint256" },
        { name: "collection", value: decision.collection, type: "string" },
        { name: "decisionHash", value: decision.hash as `0x${string}`, type: "bytes32" },
      ]);

      const tx = await eas.attest({
        schema: SCHEMA_UID,
        data: {
          recipient: "0x0000000000000000000000000000000000000000",
          expirationTime: BigInt(0),
          revocable: false,
          data: encoded,
        },
      });

      const uid = await tx.wait();
      if (uid) {
        await fetch(apiBase, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ hash: decision.hash, uid }),
        });
        setDecisions((prev) =>
          prev.map((d) => d.hash === decision.hash ? { ...d, attestationUid: uid } : d)
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "attestation failed.");
    } finally {
      setAttesting(null);
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">decisions</p>
        <button
          onClick={makeDecision}
          disabled={generating}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {generating ? <Spinner size={14} className="animate-spin" /> : <Seal size={14} weight="fill" />}
          {generating ? "generating..." : "make a decision"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {decisions.length === 0 && !generating && (
        <p className="text-sm text-neutral-400 italic">no decisions yet. your {collection} is deliberating.</p>
      )}

      <ul className="space-y-2">
        {decisions.map((d) => (
          <li key={d.hash} className="rounded-lg bg-neutral-50 border border-neutral-100 p-2.5 space-y-1.5">
            <p className="text-sm text-neutral-700 leading-relaxed">{d.text}</p>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono text-neutral-300">
                {new Date(d.ts).toLocaleDateString()} · {d.hash.slice(0, 10)}…
              </p>
              {d.attestationUid ? (
                <a
                  href={`${EASCAN_BASE}/${d.attestationUid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline"
                >
                  verified <ArrowSquareOut size={10} />
                </a>
              ) : (
                <button
                  onClick={() => attest(d)}
                  disabled={attesting === d.hash}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
                >
                  {attesting === d.hash ? (
                    <Spinner size={10} className="animate-spin" />
                  ) : (
                    <ArrowSquareOut size={10} />
                  )}
                  {attesting === d.hash ? "signing..." : "publish on-chain"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
