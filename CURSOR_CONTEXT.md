# cursor context — the employment agency (experiment fork)

paste this into a new cursor window opened on `/Users/zap/Documents/the-employment-agency`.

---

## what this is

this is the **multi-collection experiment fork** of the normie employment agency product.

| | prod (do not edit) | experiment (work here) |
|---|---|---|
| path | `/Users/zap/Documents/the-normie-employment-agency` | `/Users/zap/Documents/the-employment-agency` |
| branch | `main` | `experiment/collections` |
| deploy | https://normies.sandpark.co | not deployed yet (separate vercel project) |
| product | normie-only, route `/works/[id]` | collection-agnostic, route `/collections/[slug]/works/[id]` |

same git repo, separate worktree. changes here do not affect prod until merged and deployed separately.

read `EXPERIMENT.md` first. then `AGENTS.md`, `PLAN.md`, `PRODUCT.md`, `PROGRESS.md` (stale on this branch; update at session end).

---

## goal

turn the normie works hackathon demo into a **platform**: one employment-agency pipeline, many nft collections via adapters.

product shape per collection (unchanged):
- public employment card (viral, no wallet)
- gated system prompt + work profile (SIWE + ownership)
- optional in-app chat (venice streaming)
- wallet roster (normies works; azuki roster not built yet)

thesis is in `PRODUCT.md`: derived persona beats generic agent homogeneity. normies is the deepest adapter (pixels + canvas). others use lighter metadata dossiers.

---

## architecture (what's already built)

### collection adapters — `web/src/lib/collections/`

```ts
// each adapter implements:
type CollectionAdapter = {
  meta: CollectionMeta;           // slug, name, label, contract, maxTokenId
  loadDossier(tokenId): Dossier;  // portrait, tags, owner, cacheVersion, LLM prompt text
  isOwner(tokenId, address): bool;
}
```

| slug | file | data source |
|---|---|---|
| `normies` | `normies.ts` | api.normies.art (pixels, traits, canvas, history) |
| `azuki` | `azuki.ts` | viem `tokenURI` + `ownerOf` on `0xed5af388653567Af2f388e6224dc7c4b3241c544` |

registry: `web/src/lib/collections/index.ts` — `getCollection(slug)`, `listCollections()`.

### shared persona pipeline — `web/src/lib/persona/`

- `getPersona(collection, tokenId, dossier?)` — cache keyed `persona:{collection}:{tokenId}:{version}`
- `agencyBrief(collection)` — per-collection placement officer brief in `brief.ts`
- venice via `web/src/lib/venice.ts` (not anthropic directly)

### routes

| route | purpose |
|---|---|
| `/collections/[collection]/works/[id]` | employment card |
| `/collections/[collection]/works/[id]/chat` | owner chat |
| `/api/collections/[collection]/works/persona/[id]` | gated JSON |
| `/api/collections/[collection]/works/chat/[id]` | streaming chat |
| `/works/[id]` | redirect → `/collections/normies/works/[id]` (legacy) |
| `/roster` | normies-only roster (unchanged API) |
| `/explore` | normies-only browse |

### components updated for multi-collection

- `employment-card.tsx` — pixels or image portrait
- `gated-panel.tsx`, `share-button.tsx`, `chat-surface.tsx` — collection-aware URLs
- homepage — collection picker + mixed marquee

### auth / gating (unchanged)

- rainbowkit + wagmi + SIWE iron-session cookie (`normie-session`)
- `SESSION_SECRET` encrypts session
- ownership always live on-chain, never cached for gating

---

## stack

- next.js 16 app router, typescript, tailwind, shadcn/ui
- wagmi + viem + rainbowkit (mainnet only)
- iron-session (SIWE)
- vercel ai sdk + venice openai-compatible api (`VENICE_API_KEY`)
- upstash redis / vercel kv for persona cache (`KV_REST_API_*`)
- `@vercel/analytics` + `@vercel/speed-insights` in root layout

app lives in `web/`. vercel project root dir = `web`.

---

## dev setup

```bash
cd /Users/zap/Documents/the-employment-agency/web
cp /Users/zap/Documents/the-normie-employment-agency/web/.env.local .env.local  # if missing
pnpm install
pnpm dev
```

smoke urls:
- http://localhost:3000/collections/normies/works/42
- http://localhost:3000/collections/azuki/works/1

typecheck: `cd web && ./node_modules/.bin/tsc --noEmit`

---

## conventions (from AGENTS.md)

**writing:** lowercase in agent docs. homepage marketing copy uses title case.

**code:** simple, one pass readable. short names. no helpers for one-offs. validate at boundaries only.

**design:** quiet utility. neutral surfaces, indigo primary, phosphor icons 20px, 14px text floor, pill buttons.

**workflow:** append 2-3 lines to `PROGRESS.md` before ending session. commit WIP on this branch (`experiment/collections`). do not push to normies.sandpark.co deploy without explicit ask.

---

## current state (2026-06-04)

**done (local, uncommitted):**
- collection adapter layer + normies + azuki adapters
- collection-scoped routes, APIs, components
- homepage rebrand ("the employment agency")
- legacy `/works/*` redirects to normies collection
- typecheck passes

**not done:**
- commit + push `experiment/collections` branch
- azuki wallet roster (needs `ALCHEMY_API_KEY` or indexer)
- og image route (deleted from legacy `/works/[id]/opengraph-image`)
- separate vercel deploy
- export formats (cursor rules, claude project, etc.)
- creator dashboard / more collections

**azuki competitive note:** azuki has no per-holder persona product. closest is bobu + hallway livestream experiment (single character). gap is real.

---

## adding a new collection

1. add slug to `CollectionSlug` in `types.ts`
2. create `web/src/lib/collections/{slug}.ts` implementing `CollectionAdapter`
3. register in `index.ts`
4. add homepage examples in `featured-collections.ts`
5. add collection-specific brief in `persona/brief.ts`
6. optional: roster via alchemy `getNFTsForOwner`

---

## do not

- edit `/Users/zap/Documents/the-normie-employment-agency` unless explicitly asked to backport
- deploy this fork to normies.sandpark.co
- commit secrets (`.env.local` is gitignored)
- run `vercel deploy` from `web/` subdirectory (dashboard root is `web`; deploy from repo root)

---

## suggested next tasks

1. smoke-test azuki persona end-to-end (first hit calls venice, slow)
2. commit + push `experiment/collections`
3. azuki roster with alchemy
4. og images under `/collections/[collection]/works/[id]/opengraph-image`
5. polish azuki brief / trait-to-personality mapping
