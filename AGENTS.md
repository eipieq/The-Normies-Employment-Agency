# the normie employment agency

an umbrella product for normie holders. the agency is the home. **normie works** is the first feature: an artwork-to-ai-persona generator gated by wallet ownership.

> your normie got a job. connect your wallet to meet them.

## status

submission for the normies hackathon (https://hackathon.normies.art/). started 2026-05-20. mit-licensed per hackathon rules.

## docs in this repo

- **PLAN.md** architecture, pipeline, phases, decisions
- **DESIGN_BRIEF.md** what visual elements are needed and when
- **PROGRESS.md** living session log. read on session start, update on session end.
- **AGENTS.md** this file. context for any agent (claude, cursor, codex)
- **CLAUDE.md** pointer to this file for claude code
- **.cursorrules** pointer to this file for cursor

## naming hierarchy

- **the normie employment agency** is the umbrella product (parent). owns the landing page, wallet auth, roster.
- **normie works** is the first feature. owns the employment card and chat surface. route: `/works/[id]`.
- future features (payroll, performance reviews, the union) sit alongside without renaming.

## the api we build on

normies api: https://api.normies.art
docs: https://api.normies.art/llms.txt
no auth, no key. 60 req/min/ip sliding window.

key endpoints for normie works:

- `/normie/:id/pixels` 1600-char bitmap
- `/normie/:id/traits` decoded json
- `/normie/:id/canvas/info`, `/canvas/diff` edit state
- `/history/normie/:id/versions` edit history
- `/normie/:id/owner` ownership (used for the gate check)
- `/agents/info/:id` name + type anchor (hybrid path, gracefully 404s)
- `/holders/:address` all normies for a wallet (used for roster)

## stack (locked)

- next.js 16, app router, typescript
- tailwind, shadcn/ui
- wagmi + viem + rainbowkit (wallet)
- iron-session (siwe cookie)
- vercel ai sdk + @ai-sdk/anthropic (claude)
- vercel kv (persona cache)
- deploy to vercel

## writing style

- lowercase throughout. caps only for acronyms (MIT, SIWE, API, KV) and proper nouns that really need it.
- no em dashes. use periods, commas, colons, parens.
- short sentences. one idea per sentence.
- direct. lead with the finding, not the methodology.
- have opinions. "what actually happened is", "pretty clearly", "basically".
- no over-formatting. headers for sections, bold only when introducing a key term.
- no bold everywhere. no tables unless the data really needs one.
- no hedging when the answer is clear. a little snark on obvious things is fine.

## code style

- simple enough an undergrad reads it in one pass.
- no unnecessary abstractions. don't build helpers for things done once.
- one idea per function.
- short variable names: `id`, `pixels`, `card`, `prompt`. not `normieTokenIdentifierString`.
- import only what's needed.
- no defensive handling for things that won't fail in clean inputs.
- only validate at system boundaries (user input, external apis).
- write the obvious version first.

## design guide (quiet utility)

soft, information-dense, zero decoration. if an element doesn't carry information, it shouldn't exist.

- page bg: white
- containers/panels: neutral-100 (~#f5f5f5), rounded-2xl
- cards: white, rounded-xl, shadow `0 1px 4px rgba(0,0,0,0.06)`. depth from shadow, not color.
- default ui: neutral-400 (icons, labels, placeholders)
- text: neutral-900 titles, neutral-800 headers, neutral-500/400 secondary, neutral-300 disabled
- accents: soft, desaturated. indigo-300 for primary icons.
- status: *-50 bg with *-500 text. red=high, blue=normal, emerald=low, orange=urgent
- font: Ronzino or geometric/humanist sans. base 16px, letter-spacing -0.02em globally.
- weights: semibold for column labels, medium for card titles + interactive labels, regular elsewhere.
- icons: phosphor, weight="regular", 20px.
- spacing: containers 8px horizontal padding, cards p-3.5.

exception: the employment card on the share image is the one place we can be louder. it has to stop people in a twitter feed.

## workflow

we work in **phases** (defined in PLAN.md). each phase is a checkpoint. don't jump ahead.

current phase: see PROGRESS.md.

## handoff between agents

before switching from claude to cursor (or back):

1. append 2-3 lines to PROGRESS.md (current state, next step, blockers)
2. commit anything in flight, even WIP commits

starting in any agent, first action is always: read AGENTS.md, PLAN.md, PROGRESS.md, and `git log --oneline -10`.

## what we're not building

- own indexer or chain client. normies api covers it.
- own image storage. svgs from the api + og route are enough.
- account abstraction. siwe is enough, no on-chain writes.
- multi-chain. normies is ethereum mainnet only.
