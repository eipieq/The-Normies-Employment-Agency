# progress

session-by-session log. newest entry at top. read this when starting any session.

format: date, agent, what shipped, what's next, blockers.

---

## 2026-05-20 (claude) — phase 2 complete

shipped:

- `web/src/lib/normies/` data layer: types, api client, analyzer, archetype map, barrel
- api client (`api.ts`): typed wrappers per endpoint with next.js `fetch` cache hints. `tags: [normie:${id}]` per token for targeted invalidation. owner gets 30s revalidate (changes on transfer); everything else 5min. agentInfo gracefully returns `null` on 404.
- analyzer (`analyze.ts`): pure functions for density (count of 1s / 1600), distribution (center vs edge, quadrants, top/bottom/left/right mass), and canvas complexity (versions, churn, transformer diversity, isVirgin)
- archetype map (`archetypes.ts`): deterministic lookup from accessory→formality, eyes→perception, expression→demeanor. energy derived from density + spatial mass. flavor tags pulled from a curated set of "rare" trait values (top hat, eye patch, vr headset, etc).
- `loadFeatures(tokenId)` in `index.ts`: one call that parallels all the fetches and returns the full `NormieFeatures` bundle for the persona generator to consume in phase 3.
- smoke script (`scripts/smoke.ts`) ran on 9 fixture token ids. 8/9 worked, archetype reads were sensible (token #42 hit a transient 502 from upstream).
- typecheck clean.
- added `tsx` devDep + `pnpm smoke` + `pnpm typecheck` scripts.

friction notes:

- pnpm-workspace.yaml gets rewritten by an external linter that re-adds an `allowBuilds:` placeholder block. harmless (unknown config, ignored by pnpm) but cosmetically noisy. don't try to "fix" it.
- pnpm needed `packages: ['.']` in the workspace yaml to actually install anything in /web. without it, pnpm treated /web as an empty workspace root and installed zero packages.
- token #42 returned 502 once during smoke. handful of fixtures suggest the api is mostly reliable but flaky enough to warrant retry/fallback in phase 3.

next:

- **phase 3: persona generator**. agency brief (cached system prompt). claude call via ai sdk, structured json output, temp 0. hybrid logic (try /agents/info first, our generation otherwise). KV cache layer keyed by `(tokenid, canvasversion)`. need to provision Vercel KV and set ANTHROPIC_API_KEY.

blockers:

- anthropic api key needed before phase 3 can run end-to-end. ANTHROPIC_API_KEY env var.
- vercel KV provisioning needed before phase 3. can stub with in-memory cache initially to unblock generator work.
- wordmark + share card design still in anil's court for phase 4.

ground left uncovered (intentional):

- error handling / retry for transient API failures (saw one 502). add in phase 3 wrapper.
- vercel project link.
- ronzino font self-hosting (geist still the stand-in).

---

## 2026-05-20 (claude) — phase 1 complete

shipped:

- next.js 16 app router scaffolded into `/web` with typescript, tailwind v4 (turbopack)
- pnpm 11 chosen as package manager. native build approvals (sharp, msw, etc) configured via `pnpm.onlyBuiltDependencies` in package.json
- shadcn ui configured: radix base, new-york style, neutral palette (forced via manual components.json since CLI defaulted to base-ui which breaks ai-elements)
- globals.css carries design guide tokens: white surfaces, neutral-100 panels, indigo-300 accent, -0.02em letter-spacing global
- font: Geist (placeholder for Ronzino), with literal font names in `@theme inline` to dodge the tailwind v4 circular var bug the shadcn skill warned about
- deps installed: wagmi, viem, @rainbow-me/rainbowkit, @tanstack/react-query, ai, @ai-sdk/anthropic, iron-session
- placeholder home page renders "your normie got a job" cleanly
- dev server boots in 400ms, GET / returns 200 with no errors
- validated `shadcn add button` works — registry path is healthy for adding more components

next:

- **phase 2: data layer**. write the normies api client (typed wrappers per endpoint, runtime cache, 60/min budget aware). build the analyzer module (pixel density, spatial distribution, archetype lookup, canvas complexity). author the trait-to-archetype table. fixture-based smoke tests on 5-10 known tokenids.

blockers:

- none for phase 2. vercel link + kv provisioning still deferred to phase 3.
- wordmark + share card design still in anil's court for phase 4.

ground left uncovered (intentional, will close later):

- vercel project link (do at start of phase 3 when we need KV)
- ronzino font self-hosting (geist is the stand-in)
- env vars: nothing live yet. anthropic key + walletconnect project id needed before phase 3.
