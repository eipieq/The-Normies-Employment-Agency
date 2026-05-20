# the normie employment agency

an umbrella product for holders. the agency is the home. **normie works** is its first feature: an ai coworker for every normie holder, generated from on-chain data and unlocked by wallet ownership.

> your normie got a job. connect your wallet to meet them.

future features could live under the agency (payroll, performance reviews, the union, whatever). this plan covers normie works specifically. the agency framing is the wrapper.

## the product (normie works)

two surfaces, one pipeline.

**public**: a shareable employment card. normie face, job title, one-line character description. designed to circulate on x. no wallet needed to view.

**private**: a full claude-ready system prompt plus an in-app chat with the normie. unlocked by siwe proof that the connected wallet is the current on-chain owner.

when the normie is sold, the new owner connects, signs, and the gated surface follows ownership. previous owner keeps whatever prompt they already copied. that's fine. you can't revoke text.

## the data thesis

every normie's personality is derived entirely from on-chain data. nothing made up.

**pixel density and distribution** reads as energy and temperament. a heavy dark bitmap is not the same coworker as a sparse light one. concentrated mass at the top is different from mass at the edges.

**trait combinations** map to character. 8 categories, deterministic archetype lookup. rare combinations get unusual personalities by construction.

**canvas history** reveals behavior over time. a normie never edited is consistent and set in their ways. one with 12 transform versions and chaotic diffs has reinvented itself. multiple transformer addresses means a complex history with previous owners.

these features feed the persona generator. the agency uses the profile to place the normie in a role and write their system prompt.

## decisions locked

- **persona source**: hybrid. use `/agents/info/:id` for `name` and `type` when the normie is erc-8004 registered. fall back to generated name + trait byte 0 for type when it 404s. job placement, system prompt, work style: always our own from raw data.
- **scope**: lean + chat. landing, public card, gated prompt, siwe auth, roster, owner-only in-app chat with the generated system prompt. og sharing.
- **wallet**: rainbowkit + wagmi + viem.
- **stack**: next.js 16 app router, tailwind, shadcn/ui, vercel ai sdk (`@ai-sdk/anthropic`), iron-session for siwe, vercel kv for persona cache, deploy to vercel.

## the pipeline

per normie, the flow is fetch, analyze, generate, cache.

### fetch

parallel calls to api.normies.art, results cached server-side by tokenid + canvas version.

- `/normie/:id/traits` — 8 trait categories, decoded json
- `/normie/:id/pixels` — 1600-char bitmap
- `/normie/:id/canvas/info` — level, action points, customized flag
- `/normie/:id/canvas/diff` — added/removed pixel counts
- `/history/normie/:id/versions` — edit history length and churn
- `/normie/:id/owner` — current holder, also used for the ownership gate
- `/agents/info/:id` — name and type when available, graceful 404 otherwise

### analyze

pure functions. no llm. unit-testable.

- **pixel density**: count of 1s over 1600. high reads as intense, low as sparse.
- **spatial distribution**: quadrant counts, edge vs center mass. tells us where visual weight sits.
- **trait archetype**: deterministic lookup we author. byte 0 (type) seeds the broad category.
- **canvas complexity**: version count, average pixel churn per edit, transformer diversity. proxy for "how stable is this character".

### generate

claude via the ai sdk. structured json output. temperature 0.

- system prompt holds the agency brief (stable, prompt-cached).
- user turn is the structured features for one normie.
- output: `{ jobtitle, oneliner, workstyle, strengths, blindspots, systemprompt }`.
- determinism matters. "this is your coworker", not "a different coworker every refresh".

### cache

vercel kv, keyed by `(tokenid, canvasversion)`. only re-runs when canvas state changes. solves both cost and persona drift.

## architecture

### routes

agency wrapper at root, normie works lives under `/works`. leaves room for future agency features without a rename later.

- `/` agency landing
- `/works/[id]` public employment card with gated panel (the normie works feature)
- `/roster` your normies, wallet-gated list (agency-level, lists all your normies across features)
- `/works/[id]/chat` owner-only chat with your normie, streaming
- `/api/works/persona/[id]` server route. public card data always. full prompt only with valid siwe and ownership match.
- `/api/works/chat/[id]` streaming chat endpoint, owner-gated, per-session rate limit
- `/api/auth/siwe/{nonce,verify,logout}` agency-level auth surface
- `/works/[id]/opengraph-image` next/og card for x sharing

### auth

rainbowkit modal, siwe message, server verifies signature with viem, session cookie via iron-session. ownership check helper: session address must equal current `/normie/:id/owner` at request time. never trust cached owner for gating.

### design

per the design guide saved in memory. white page bg, neutral-100 panels, white cards with the near-imperceptible shadow. neutral text hierarchy. indigo-300 as the single accent for primary icons. phosphor icons at 20px regular. ronzino with -0.02em letter-spacing.

the employment card is the one visual showpiece. everything else stays quiet.

## risks worth flagging now

- **persona drift on refresh**: temperature 0 plus canvas-version cache key solves it. verify once the generator is live.
- **rate limit**: normies api is 60/min/ip. our server must mirror every fetch into kv. a popular card on x cannot burn the budget for everyone.
- **ownership transfer race**: cached og image post-sale is fine. gated prompt and chat must always recheck current owner against session address. zero exceptions.
- **chat abuse**: owner gets the full surface. public visitors get a one-shot greeting preview at most. per-session token quota on the api route.
- **share card is the viral surface**: this is where real design effort goes. autogenerated grid won't do it.
- **agents/info coverage**: most normies are not erc-8004 registered. the hybrid path must handle 404 transparently. judges will test with random tokenids.

## phases and subtasks

work in this order. each phase is a checkpoint.

### phase 1: foundation

- scaffold next.js 16, tailwind, shadcn, typescript
- link vercel project, set env vars (walletconnect project id, anthropic api key, kv creds, siwe session secret)
- install wagmi, viem, rainbowkit, ai sdk + anthropic provider, iron-session
- configure shadcn theme to match the design guide (tokens, font, shadow scale)

### phase 2: data layer

- normies api client, typed wrapper per endpoint
- runtime cache with 60/min budget awareness
- analyzer module: pixel density, distribution, archetype lookup, canvas complexity
- archetype table (deterministic mapping from trait combinations to broad character categories)
- fixture-based smoke tests on 5-10 known tokenids covering different profiles

### phase 3: persona generator

- agency brief (the stable system prompt, prompt-cached)
- claude call via ai sdk, structured output, temperature 0
- hybrid logic: try `/agents/info` first, fall back cleanly on 404
- kv cache layer keyed by `(tokenid, canvasversion)`
- generate for the test fixtures, eyeball the output

### phase 4: public card

- `/works/[id]` page
- employment card component (this is the design showpiece)
- og image route via next/og
- "share on x" button with prefilled text
- 404 for out-of-range or unminted ids

### phase 5: auth and gating

- rainbowkit connect modal, themed
- siwe flow: nonce endpoint, sign client-side, verify endpoint, session cookie
- ownership gate helper used by `/api/works/persona/:id` and `/api/works/chat/:id`
- gated panel reveal on the card

### phase 6: chat surface

- `/api/works/chat/[id]` streaming endpoint with the generated system prompt
- `/works/[id]/chat` ui (messages list, input, streaming render)
- per-session rate limit

### phase 7: roster

- `/roster` page, lists all normies for the connected wallet via `/holders/:address`
- click-through to each normie's page

### phase 8: landing and polish

- `/` agency landing: pitch, normie works feature card, connect cta, room for "more coming soon" if we want it
- copy and typography pass
- mobile sanity check
- final design pass on the employment card

### phase 9: ship

- production deploy
- custom domain
- hackathon submission write-up

## what we're not building

- own indexer or chain client. normies api covers it.
- own image storage. svgs from the api plus the og route are enough.
- account abstraction or gasless. siwe is enough; no on-chain writes anywhere.
- multi-chain anything. normies is ethereum mainnet only.
- a backend for the persona generator output beyond kv cache. the prompt is the deliverable. holders take it elsewhere.

## license

mit, per hackathon rules.
