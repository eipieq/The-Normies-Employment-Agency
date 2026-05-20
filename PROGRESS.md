# progress

session-by-session log. newest entry at top. read this when starting any session.

format: date, agent, what shipped, what's next, blockers.

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
