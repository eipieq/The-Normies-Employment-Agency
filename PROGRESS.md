# progress

session-by-session log. newest entry at top. read this when starting any session.

format: date, agent, what shipped, what's next, blockers.

---

## 2026-05-20 (cursor) — phase 4 complete

shipped:

- `web/src/app/works/[id]/page.tsx` — server component. loads features + persona (single `loadFeatures` call shared via the updated `getPersona(tokenId, features?)` signature). 404s on unminted/out-of-range ids. generates full `<head>` metadata including og tags.
- `web/src/components/employment-card.tsx` — the employment card. portrait panel (neutral-100 bg), job title, one-liner, archetype meta row, canvas history note, gated section placeholder (lock icon + "connect wallet"), share button.
- `web/src/components/normie-portrait.tsx` — renders the 40x40 pixel bitmap as a crisp SVG. also exports `pixelsToDataUrl` for the OG route (converts to base64 svg data url).
- `web/src/components/share-button.tsx` — client component. builds the x.com/intent/post url with job title + one-liner + page url.
- `web/src/app/works/[id]/opengraph-image.tsx` — next/og image at 1200x630. loads Inter Medium + Regular from bunny fonts. layout: portrait panel (left, 460px, #e8e8e8 bg, portrait at 320x320) + content panel (right, job title at 52px, one-liner at 20px, bottom row with token id + category). uses the normie's pixel art via data url.
- `web/src/app/works/[id]/not-found.tsx` — clean 404 page.
- updated `getPersona` to accept optional pre-loaded `NormieFeatures` to avoid double-fetching in the page.
- phosphor-icons/react installed.

all routes confirmed: /works/6303 → 200, /works/99999 → 404, /works/6303/opengraph-image → 200.

design notes:
- no placeholder wordmark needed — typography carries the card cleanly with geist + design guide tokens.
- employment card is deliberately quiet. lock icon + neutral-50 panel for the gated section telegraphs "something's here" without being decorative.

next:

- **phase 5: auth + gating**. rainbowkit connect modal, siwe flow (nonce endpoint, verify endpoint, iron-session cookie), ownership gate helper. gated panel on the card reveals when ownership is verified.

blockers:

- needs walletconnect project id (`NEXT_PUBLIC_WC_PROJECT_ID`) for rainbowkit. get from https://cloud.reown.com. add to `.env.local`.
- pnpm 11 `approve-builds` needs to be run manually once to allow esbuild + sharp build scripts. run `pnpm approve-builds` in web/ and toggle esbuild + sharp on. dev server can be started directly via `./node_modules/.bin/next dev` as a workaround.

---

## 2026-05-20 (cursor) — phase 3 complete

shipped:

- `web/src/lib/persona/` — types, agency brief (stable system prompt), generator, fs cache, orchestrator (`getPersona`)
- generator uses `generateText` + manual JSON parse/zod validate. venice's openai-compatible endpoint doesn't support structured outputs or tool call mode — worked around with explicit JSON instructions in the prompt + code-fence stripping. works reliably.
- persona quality confirmed: the brief is landing. #1 "junior trail-state continuity steward", #100 "principal emeritus of unfashionable certainties", #1337 "senior loss prevention specialist, unspecified inventory". voice is dry, specific, correct.
- fs cache at `web/.cache/personas/<tokenId>-<canvasVersion>.json` (gitignored). swap for upstash redis at deploy time.
- `web/scripts/persona-smoke.ts` + `pnpm persona-smoke` script added.
- retry/backoff (3 attempts, 300ms/600ms exp) added to normies api client for 5xx transients.
- `zod` installed as dep. typecheck clean.

friction notes:

- `generateObject` / structured outputs don't work with venice's openai-compatible endpoint. `mode: 'tool'` also fails. `generateText` + JSON parsing is the reliable path.
- system `dotenv` binary has a different CLI syntax than `dotenv-cli`. pnpm scripts resolve fine via `node_modules/.bin`; direct shell invocations need the local binary path.
- pnpm 11 `approve-builds` is interactive and can't run in automation. `pnpm.onlyBuiltDependencies` in package.json covers it, but the sandbox strips the store path — run `pnpm approve-builds` manually once if fresh install is needed.

next:

- **phase 4: public card**. `/works/[id]` page, employment card component (the design showpiece), og image route via next/og, share button. needs: normie works mark + og card design from design brief.

blockers:

- normie works mark + og share card design (DESIGN_BRIEF.md). hard blocker for phase 4. currently in anil's court.
- `pnpm persona-smoke` works but slow (~55s for 3 normies due to sequential venice calls). acceptable for now.

---

## 2026-05-20 (claude) — phase 3 in progress (handing off)

shipped this session:

- decision locked: use **venice ai** instead of direct anthropic for persona generation. venice's openai-compatible api proxies many models including claude. default model: **`claude-opus-4-7`** (venice flagship tier, $30/1m out, user has credits)
- swapped `@ai-sdk/anthropic` for `@ai-sdk/openai-compatible@2.0.47`
- installed `tsx` + `dotenv-cli` as devdeps (tsx doesn't auto-load `.env.local`, so all scripts need `dotenv -e .env.local --` prefix)
- env: `.env.example` template at `web/.env.example` lists all needed vars. `.env.local` exists locally with the user's venice key (gitignored). `.env*` blanket-ignored in /web/.gitignore but `!.env.example` exception added so the template gets committed.

**security note for next agent**: user pasted their venice key into `.env.example` by accident at one point. file is gitignored at that moment so nothing leaked into git. user was asked to rotate the key at https://venice.ai/settings/api and re-paste into `.env.local`. *verify with user whether they rotated before relying on the key for anything sensitive*. if they did rotate, the new key should be in `.env.local`.

what is *not* yet done in phase 3:

- write the persona module under `web/src/lib/persona/`:
  - `types.ts` — `Persona` shape: `{ jobTitle, oneLiner, workStyle, strengths[], blindSpots[], systemPrompt }`
  - `brief.ts` — the agency's stable system prompt (the "brief"). this is what tells the LLM to act as the placement officer, use the structured features as evidence, and write in our voice.
  - `generator.ts` — `generatePersona(features: NormieFeatures): Promise<Persona>` using ai sdk's `generateObject` with a zod schema. temp 0. model: `claude-opus-4-7`. provider via `createOpenAICompatible({ name: 'venice', baseURL: 'https://api.venice.ai/api/v1', apiKey: process.env.VENICE_API_KEY! })`.
  - `cache.ts` — simple key/value cache keyed by `${tokenId}:${canvasVersion}`. **start with a filesystem cache** writing to `web/.cache/personas/${key}.json` (gitignore `.cache`). swap to a hosted KV later. NOTE: `@vercel/kv` is sunset per the vercel-storage skill that auto-loaded this session. when we get to prod, provision **Upstash Redis via Vercel Marketplace** instead.
  - `index.ts` — barrel + `getPersona(tokenId)` orchestrator that calls `loadFeatures` (phase 2), checks cache, generates if miss, stores, returns.
- write `web/scripts/persona-smoke.ts` — pick 2-3 fixture token ids, run `getPersona` on each, print job title + one-liner + first 500 chars of system prompt.
- update `web/package.json` scripts:
  - `"smoke": "dotenv -e .env.local -- tsx scripts/smoke.ts"` (fix existing — it currently uses tsx without dotenv, so VENICE_API_KEY would be undefined)
  - `"persona-smoke": "dotenv -e .env.local -- tsx scripts/persona-smoke.ts"` (new)
- run persona-smoke end-to-end to confirm venice + claude-opus-4-7 returns sensible structured output
- consider adding retry/backoff to the api client wrapper in `web/src/lib/normies/api.ts` — saw one 502 on token #42 during phase 2 smoke. wrap the inner `fetch` in a simple retry with exponential backoff.

hybrid persona logic (from PLAN.md, do this in `generator.ts`):

- if `features.agent` is not null (normie is erc-8004 registered), use `features.agent.name` and `features.agent.type` as the name + type anchors in the prompt
- if null, the generator invents a name and uses trait byte 0 (already in `features.traits` as the "Type" attribute) for type
- everything else (job, system prompt, work style) is always our own from raw data

writing style for the generated personas: lowercase, dry employment-agency humor, short sentences. read the brief carefully — the LLM needs to know our voice or it'll generate generic copy.

blockers:

- needs the venice key to be live in `.env.local` for end-to-end test. if user has rotated, the new key should already be there. if not, ask before running smoke.

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
