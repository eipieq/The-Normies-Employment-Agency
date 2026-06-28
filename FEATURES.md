# features roadmap

three features planned for the experiment fork. build order below.

---

## 0 — pre-work

commit all uncommitted work on `experiment/collections` branch before starting anything.

---

## 1 — structured taxonomy via k-means

**status:** not started

assign every normie a department based on pixel + trait similarity.

### approach

two-phase: run a batch script once to compute centroids from ~500 normies, then assign at runtime via nearest-centroid (pure function, no ML dependency at request time).

**feature vector (18-dim):**
- density, topMass, bottomMass, centerMass, edgeMass, versionCount (normalized), avgChurnPerEdit (normalized)
- category one-hot (4), formality one-hot (4), energy one-hot (3)

**8 departments (K=8):**
| cluster | department | grade |
|---------|-----------|-------|
| 0 | entropy management | jr. continuity officer |
| 1 | strategic continuity | sr. institutional memory specialist |
| 2 | distributed operations | associate field operative |
| 3 | pattern recognition services | principal analyst |
| 4 | client experience | engagement coordinator |
| 5 | emergent technologies | staff systems integrator |
| 6 | organizational development | deputy director |
| 7 | creative infrastructure | lead experimental practitioner |

### files

- `web/scripts/cluster-normies.ts` — batch script, writes centroids.json
- `web/src/lib/cluster/index.ts` — `buildVector`, `assignCluster`, `getLabel`, `getDepartment`
- `web/src/lib/cluster/centroids.json` — committed artifact from script run
- `web/src/lib/collections/types.ts` — add optional `getDepartment?` to `CollectionAdapter`
- `web/src/lib/collections/normies.ts` — implement getDepartment
- `web/src/lib/persona/brief.ts` — inject department context into normies brief
- `web/src/components/employment-card.tsx` — department badge between job title and tags

**azuki:** `getDepartment` returns null for now. separate clustering pass later (different feature space).

**dependency:** `ml-kmeans` package.

---

## 2 — persistent state + feedback loop

**status:** not started

### phase 2a — conversation history (ship first)

store chat history per (address, collection, tokenId) in upstash redis lists.

- key: `history:{collection}:{tokenId}:{address_lowercase}`
- 40 items max (20 turns), trimmed via LTRIM after each write
- chat route: load last 20 turns before `streamText`, save via `onFinish` callback

**new file:** `web/src/lib/chat-history.ts` — `loadHistory`, `appendHistory`
**modified:** chat route `app/api/collections/[collection]/works/chat/[id]/route.ts`

### phase 2b — performance score (add-on, ship with 2a)

- key: `perf:{collection}:{tokenId}` (redis hash)
- fields: `messages` (total), `lastActive` (timestamp)
- incremented inside `appendHistory`, surfaced as a stat on the gated panel

### phase 2c — pixel feedback loop (deferred)

blocked on normies canvas contract ABI (edit/burn function signatures). when unblocked:

1. add pixel suggestion surface — the normie recommends a canvas change
2. owner signs the tx via wagmi `useWriteContract`
3. on success, invalidate `normie:{id}` cache tag

for now: system prompt gets a line letting the character voice canvas preferences in chat.

---

## 3 — on-chain agency via EAS

**status:** not started

normies make auditable on-chain decisions. venice generates a 1-2 sentence decision in character
voice → hashed via viem keccak256 → pre-image stored in upstash → owner signs an EAS attestation
client-side using wagmi.

**why EAS:** no custom contract deployment. schema registered once. cheap attestations. public
verification at easscan.org. available on ethereum mainnet + base + op.

### schema

register once:
```
uint256 tokenId, string collection, bytes32 decisionHash
```
pre-image key: `decision:{collection}:{tokenId}:{hash}` → `{ text, ts, uid }`

### files

- `web/src/lib/decisions.ts` — `generateDecision`, `hashDecision`, `storeDecision`, `loadDecisions`
- `web/src/app/api/collections/[collection]/works/decisions/[id]/route.ts` — generate + store (server)
- `web/src/components/decision-attest.tsx` — client-side EAS attestation via wagmi
- `web/src/components/gated-panel.tsx` — add decision log section (owner-only)
- `web/src/lib/collections/types.ts` — add optional `getDecisions?` to `CollectionAdapter`
- both adapters — implement `getDecisions` (same upstash lookup, collection-scoped keys)

**env vars needed:**
- `NEXT_PUBLIC_EAS_CONTRACT` — EAS contract address (default: base mainnet)
- `NEXT_PUBLIC_EAS_SCHEMA_UID` — registered schema UID

**dependency:** `@ethereum-attestation-service/eas-sdk`

### ui

decision log in the gated panel: last 10 decisions, timestamp, first 80 chars of text, "verify →"
link to easscan.org. "make a decision" button triggers the generate → sign flow.

---

## implementation order

| step | feature | blocker |
|------|---------|---------|
| 0 | commit experiment fork | — |
| 1 | 2a/2b: chat history + perf score | upstash already provisioned |
| 2 | 1: batch clustering script + centroids.json | one-time pnpm run |
| 3 | 1: runtime assignment + card badge | centroids committed |
| 4 | 3: EAS decisions (API + client) | register EAS schema once |
| 5 | 2c: pixel feedback | canvas contract ABI |

---

## out of scope

- zkML / verifiable inference — tooling immature, impractical for hosted LLM calls
- azuki clustering — deferred, different feature space
- `the-normie-employment-agency` prod — no changes until fork is stable and deployed separately
