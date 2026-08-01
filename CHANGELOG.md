# Changelog

All notable changes to The Employment Agency are documented here.
Entries are ordered newest-first within each version.

---

## [Unreleased] — `experiment/collections` branch

### 2026-08-01

#### Security
- **fix(security): IDOR in attestation UID update** (`fafcf3b`)
  - `updateAttestationUid` now accepts `expectedCollection` + `expectedTokenId` and verifies the stored decision belongs to the requesting token before writing
  - PATCH handler returns 404 if hash doesn't match the authorized token
  - Without this, any subscriber could overwrite another token's attestation UID using a hash obtained from public on-chain EAS data

#### Features
- **feat: Azuki clustering + multi-collection roster** (`0a294c3`)
  - `cluster/azuki.ts` — deterministic trait-based department assignment: elemental hair (water/lightning/spirit/earth/wind) → emergent technologies, offhand item → creative infrastructure, rare type → organizational development, face energy + clothing formality → remaining 5 departments
  - `CollectionAdapter` interface now includes optional `getHoldings(address): Promise<number[]>`
  - Azuki adapter implements `getDepartment` (trait-based) and `getHoldings` (Alchemy `getNFTsForOwner`, paginated)
  - New `/api/roster/azuki` endpoint returning `{ address, items[{ tokenId, portrait, jobTitle, oneLiner }] }`
  - Roster page now has a normies/azuki tab switcher; each collection loads lazily on first tab visit
- **feat: proxy.ts — Next.js 16 convention** (`0a294c3`)
  - Renamed `middleware.ts` → `proxy.ts`, export renamed to `proxy()`; eliminates deprecation warning in build output

#### Infrastructure
- **feat: production deployment** — app live at `https://web-psi-one-yljwms7fyt.vercel.app`
  - All env vars set: KV (Upstash Redis), Venice AI, iron-session, NOWPayments, WalletConnect, EAS, Alchemy
  - EAS schema registered on Base mainnet: `0xd8247c4fd6e67f0c8756e1171dd6fb8c078ef3572235207d6c8ecdc0d2e3b5da`
  - Schema: `uint256 tokenId, string collection, bytes32 decisionHash`

#### Observability
- **feat: structured error logging** (`b88958a`)
  - `[agency:error]` tagged `console.error` calls on all critical failure surfaces
  - Covers: Venice AI call failures, JSON parse errors, Redis errors (get/set/pipeline), rate-limit Redis failures (fails open), subscription activation errors (rethrows)
  - All logs include structured context `{ collection, tokenId, address, error }` — visible in Vercel log drain without Sentry

#### Security hardening
- **feat: OG image + edge middleware** (`4e50486`)
  - OG image route at `/collections/[collection]/works/[id]/opengraph-image` — 1200×630 PNG, handles pixel art (normies) and remote image (azuki), Inter fonts from bunny.net, graceful wordmark fallback
  - Edge-level session cookie check on `/api/collections/*`, `/api/subscriptions/checkout|status`; webhook excluded (NOWPayments calls without session)
- **feat: production hardening P0 + P1** (`829214a`)
  - All Redis keys prefixed `agency:` to prevent collision with normies prod on shared Upstash instance
  - Decisions endpoint rate-limited (10/hr per address via `checkChatRateLimit`)
  - Chat messages capped at last 20 turns server-side (prevents token cost abuse)
  - SIWE verify: domain validated against `Origin` header, expiry checked
  - Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS (production only)
  - Session cookie renamed `normie-session` → `agency-session` (prevents collision on shared subdomains)
  - Legacy `/api/works/chat` and `/api/works/persona` routes deleted

#### Payments
- **feat: NOWPayments crypto subscription gate** (`98e0756`)
  - Per-wallet subscription state in Upstash Redis with 35-day TTL (30-day cycle + 5-day grace)
  - `POST /api/subscriptions/checkout` — creates NOWPayments invoice via `/v1/invoice` (API key auth), returns redirect URL. `ipn_callback_url` embedded per-invoice so no dashboard config needed
  - `GET /api/subscriptions/status` — returns `{ subscribed, renewsAt }` for current session
  - `POST /api/subscriptions/webhook` — IPN handler with HMAC-SHA512 signature verification (keys sorted alphabetically before hashing, per NOWPayments spec)
  - Persona, chat, and decisions routes return 402 when owner but not subscribed
  - Gated panel: new "subscribe" state with $14.99/mo CTA; `?preview=subscribe` for dev preview
  - `/subscribed` success landing page

---

## v0 — `main` branch (normies.sandpark.co)

### 2026-05-21

#### Infrastructure
- **chore: Vercel Analytics** (`cc96ad9`) — replaced Mixpanel with `@vercel/analytics` + `@vercel/speed-insights`
- **fix: mobile layout** (`1bb5798`) — homepage, header, and CTAs responsive on mobile
- **feat: prod deploy** — live at normies.sandpark.co

#### Features
- **feat: chat surface, roster, public wallet gallery** (`b3f99d9`)
  - `/api/works/chat/[id]` — streaming endpoint, SIWE + ownership gate, 30 msg/hr rate limit, Venice `streamText` with cached persona `systemPrompt`
  - `/works/[id]/chat` — owner-only chat page, `useChat` + `DefaultChatTransport`, streaming status
  - `/api/roster` — lists normies held by connected wallet via normies API `/holders/:address`
  - `/roster` — wallet roster page with preview grid
  - `/roster/[address]` — public roster page for any wallet address
- **feat: explore page + Upstash persona cache** (`f7759b4`)
  - `/explore` — search by token ID + 15 featured normie preview cards
  - Persona cache swapped from filesystem to Upstash Redis in production

### 2026-05-20

#### Features
- **feat: UI polish** (`6e9a05f`, `2338aea`, `3eca3e5`, `5ce1e0c`)
  - Paper-grain background (`debut-light.png`), saturated blue primary (`oklch(0.52 0.22 264)`), Plus Jakarta Sans body font, Geist Mono for numerals
  - Employment card: 4 sub-containers, chips for meta/tags, pixel-square title, X share button
  - Preview card: white outer shell, neutral-100 tiles, hover shadow lift
  - Homepage: hero, live example normies marquee (8 cards, infinite CSS scroll), how-it-works, coming soon strip
  - Footer: Instrument Sans wordmark, normies.art + adsq.me links
  - 14px text floor enforced across all components

- **feat: auth + ownership gating — phase 5** (`3f08fbe`)
  - RainbowKit wallet connect, SIWE flow (nonce → verify → iron-session cookie)
  - `/api/auth/nonce`, `/api/auth/verify`, `/api/auth/logout`, `/api/auth/status`
  - Ownership gate: live `ownerOf` check via normies API
  - Gated panel: reveals work style, strengths/blind spots, system prompt when owner verified

- **feat: public employment card + OG image — phase 4** (`4bf0f10`)
  - `/works/[id]` — server-rendered card with portrait, job title, one-liner, archetype meta
  - `normie-portrait.tsx` — 40×40 pixel bitmap rendered as crisp SVG
  - OG image at 1200×630 via `next/og`, Inter fonts from bunny.net
  - Share to X button with intent URL

- **feat: persona generator — phase 3** (`7bfc04e`, `81832a0`)
  - Venice AI (OpenAI-compatible, proxies claude-opus) via `@ai-sdk/openai-compatible`
  - `generateText` + manual JSON parse + Zod validation (structured outputs not supported by Venice)
  - Filesystem cache keyed by `(tokenId, canvasVersion)` for local dev; Redis in production
  - Persona shape: `{ jobTitle, oneLiner, workStyle, strengths[], blindSpots[], systemPrompt }`
  - Agency brief system prompt establishes dry employment-agency voice

- **feat: data layer — phase 2** (`ae035a2`)
  - Normies API client: typed wrappers with Next.js fetch cache hints, retry/backoff on 5xx
  - Pixel analyzer: density, spatial distribution (quadrants, center/edge mass)
  - Archetype map: accessory → formality, eyes → perception, expression → demeanor, density → energy
  - `loadFeatures(tokenId)` — single parallel fetch for all normie data

- **feat: scaffold — phase 1** (`eab2715`)
  - Next.js 16 App Router, TypeScript, Tailwind v4, Turbopack
  - wagmi + RainbowKit + viem, Vercel AI SDK, iron-session
  - shadcn/ui (Radix base, new-york style, neutral palette)
  - Design tokens: white surfaces, neutral-100 panels, letter-spacing −0.02em

### 2026-05-20 (initial)
- **feat: collection adapter layer** (`e28742c`) — `CollectionAdapter` interface with normies and azuki adapters
- **refactor: multi-collection platform** (`3546f8e`) — all routes, components, and lib wired for collection-agnostic operation; homepage rebranded to "the employment agency"

---

## Multi-collection features (experiment branch additions over v0)

| Feature | normies | azuki |
|---|---|---|
| Employment card | ✅ | ✅ |
| Persona generation | ✅ | ✅ |
| Ownership gate | ✅ (normies API) | ✅ (viem ownerOf) |
| Chat | ✅ | ✅ |
| On-chain decisions (EAS) | ✅ | ✅ |
| Taxonomy clustering | ✅ ML-derived K=8 | ✅ trait-based |
| Wallet roster | ✅ normies API | ✅ Alchemy getNFTsForOwner |
| OG image | ✅ pixel art | ✅ remote image |
| Subscription gate | ✅ | ✅ |
