# Production Readiness Plan

Branch: `experiment/collections`
Target: separate Vercel project (not normies.sandpark.co)

---

## Status at time of writing

Three feature phases are complete and committed:
- `ac17785` — persistent chat history + performance tracking
- `f26c933` + `7a5254b` — k-means taxonomy clustering + ML centroids
- `2ba079f` — on-chain decisions via EAS
- `98e0756` — NOWPayments subscription gate ($14.99/mo invoice flow)

App runs locally at localhost:3000. Not yet deployed.

---

## P0 — Blockers (nothing ships without these)

### 1. Rate limit the decisions endpoint
**File:** `web/src/app/api/collections/[collection]/works/decisions/[id]/route.ts`
**Problem:** POST generates an AI decision via Venice — no rate limit. An owner can spam it and rack up API cost.
**Fix:** Import `checkChatRateLimit` (already exists) and add a per-address check before generating. Limit: 10 decisions/hr per address is reasonable.

```ts
const { ok } = await checkChatRateLimit(session.address, `decisions:${adapter.meta.slug}:${tokenId}`);
if (!ok) return new Response("rate limit exceeded", { status: 429 });
```

### 2. Namespace Redis keys for this app
**Problem:** The experiment fork shares the same Upstash Redis instance as normies prod (`main` branch). Chat rate limit keys (`chat:{address}:{scope}`) and any unscoped keys will collide.
**Fix:** Add an `agency:` prefix to all keys in:
- `web/src/lib/chat-rate-limit.ts` — change key to `agency:chat:{address}:{scope}`
- `web/src/lib/chat-history.ts` — change key to `agency:history:{...}`
- `web/src/lib/persona/cache.ts` — change key to `agency:persona:{...}`
- Subscription and decision keys already use `agency:` prefix — leave as-is.

### 3. Set a production RPC
**Problem:** `web/src/lib/evm.ts` falls back to `https://ethereum-rpc.publicnode.com` with no SLA. Azuki `ownerOf` and all on-chain ownership checks go through it.
**Fix:** Set `MAINNET_RPC_URL` (server-side, not NEXT_PUBLIC) in Vercel env vars.
Recommended: Alchemy or Infura. Add `ALCHEMY_API_KEY` to Vercel and it will be picked up automatically by `evm.ts`.

### 4. Register EAS schema
**Problem:** `NEXT_PUBLIC_EAS_SCHEMA_UID` is empty — the "publish on-chain" button shows an error for every user.
**Fix:** Go to https://base.easscan.org/schema/create and register:
```
uint256 tokenId, string collection, bytes32 decisionHash
```
Copy the schema UID → set as `NEXT_PUBLIC_EAS_SCHEMA_UID` in Vercel env vars.
One-time action, ~5 minutes.

---

## P1 — Security (required before public traffic)

### 5. Validate SIWE domain and expiry
**File:** `web/src/app/api/auth/verify/route.ts`
**Problem:** The verify route checks nonce and recovers address, but never validates `parsed.domain`, `parsed.chainId`, or `parsed.expirationTime`. A SIWE message signed for another app could authenticate here.
**Fix:**
```ts
const parsed = parseSiweMessage(message);

// Add after nonce check:
const expectedDomain = new URL(req.headers.get("origin") ?? "").hostname;
if (parsed.domain !== expectedDomain) return new Response("domain mismatch", { status: 422 });
if (parsed.chainId !== 1) return new Response("wrong chain", { status: 422 });
if (parsed.expirationTime && new Date(parsed.expirationTime) < new Date()) {
  return new Response("message expired", { status: 422 });
}
```

### 6. Add HTTP security headers
**File:** `web/next.config.ts`
**Problem:** No security headers set — no CSP, no X-Frame-Options, no HSTS.
**Fix:** Add a `headers()` export:
```ts
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ],
  }];
}
```
Note: CSP needs careful tuning for RainbowKit/WalletConnect inline scripts — start with the above and add CSP once deployed and tested.

### 7. Trim incoming chat messages server-side
**File:** `web/src/app/api/collections/[collection]/works/chat/[id]/route.ts`
**Problem:** The full `messages` array from the client is passed to `convertToModelMessages` with no cap. A crafted request with a huge history inflates token costs.
**Fix:** Slice before conversion:
```ts
const { messages } = (await req.json()) as { messages: UIMessage[] };
const trimmed = messages.slice(-20); // keep last 20 turns max
// use trimmed instead of messages below
```

### 8. Rename the session cookie
**File:** `web/src/lib/session.ts`
**Problem:** Cookie is named `normie-session`. If this app is deployed under a subdomain shared with normies prod, session cookies will collide.
**Fix:** Change `cookieName` to `"agency-session"`.

### 9. Remove or lock down legacy routes
**Files:**
- `web/src/app/api/works/chat/[id]/route.ts`
- `web/src/app/api/works/persona/[id]/route.ts`

**Problem:** These are pre-collection-adapter routes still mounted and accessible. They may have different security postures.
**Fix:** Delete both files. The collection-scoped routes under `/api/collections/[collection]/works/` fully replace them.

---

## P2 — Missing features vs. normies prod

### 10. Rebuild OG image route
**Problem:** The OG image route was under `/app/works/[id]/opengraph-image` and was removed in the collection refactor. Every shared link shows a blank preview.
**Fix:** Create `/app/collections/[collection]/works/[id]/opengraph-image.tsx` using Next.js `ImageResponse`. Render the employment card portrait + job title + one-liner. Reference the existing normies prod implementation for the pixel rendering approach.

### 11. Add a global middleware auth guard
**File:** `web/src/middleware.ts` (create)
**Problem:** No global middleware — each API route individually checks the session. A new route that forgets the check is silently unprotected.
**Fix:**
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/api/collections", "/api/subscriptions/checkout", "/api/subscriptions/status"];

export function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();
  // Session is an encrypted cookie — full iron-session decode only works in route handlers.
  // At edge, just check cookie presence as a first gate:
  const hasSession = req.cookies.has("agency-session");
  if (!hasSession) return new NextResponse("unauthenticated", { status: 401 });
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
```
Note: this is a shallow check (cookie presence only). Full session decode + ownership still happens in each route handler. The middleware just catches missing-cookie requests at the edge before they hit application code.

### 12. Error monitoring
**Problem:** No visibility into Venice failures, Redis timeouts, or RPC errors in production. They surface as 500s with no context.
**Fix:** Add Sentry. Install `@sentry/nextjs`, run `npx @sentry/wizard@latest -i nextjs`. Alternatively, Vercel's built-in log drain (Vercel dashboard → Logs) gives basic visibility without a dependency.

---

## P3 — Deployment

### 13. Deploy to a separate Vercel project

1. In Vercel dashboard: **Add New Project** → import `eipieq/The-Normies-Employment-Agency`
2. Set **Root Directory** to `the-employment-agency/web`
3. Set **Branch** to `experiment/collections`
4. Add all env vars from `.env.example` (filled in)
5. Do NOT point this at normies.sandpark.co — give it a separate domain or use the Vercel preview URL initially

**Required env vars for deployment:**
```
KV_REST_API_URL                   # Upstash Redis (or use Vercel KV integration)
KV_REST_API_TOKEN
VENICE_API_KEY
SESSION_SECRET                    # openssl rand -base64 32
NEXT_PUBLIC_WC_PROJECT_ID
MAINNET_RPC_URL                   # or ALCHEMY_API_KEY
NOWPAYMENTS_API_KEY
NOWPAYMENTS_IPN_SECRET
NOWPAYMENTS_PLAN_ID=1164955337
NEXT_PUBLIC_EAS_CONTRACT=0x4200000000000000000000000000000000000021
NEXT_PUBLIC_EAS_SCHEMA_UID        # after step 4 above
NEXT_PUBLIC_URL                   # your Vercel domain
```

### 14. Register NOWPayments IPN webhook URL
After deploying, go to NOWPayments dashboard → **Store Settings → IPN**.
Set the callback URL to: `https://yourdomain.com/api/subscriptions/webhook`

---

## Deferred (not blocking launch)

- **Pixel feedback loop** — needs Normies canvas contract ABI (edit/burn functions). Deferred until ABI is sourced.
- **Azuki clustering** — separate k-means pass on trait-only vectors. Deferred until azuki collection is prioritized.
- **Azuki wallet roster** — needs `ALCHEMY_API_KEY` and `getNFTsForOwner` wiring.
- **Full CSP header** — needs testing against RainbowKit/WalletConnect script requirements before enabling.
- **Backport decision** — merge `experiment/collections` → `main` and redeploy normies prod, or keep as separate product.

---

## Execution order

| Step | Item | Est. time | Who |
|------|------|-----------|-----|
| 1 | Rate limit decisions endpoint | 20 min | dev |
| 2 | Namespace Redis keys | 30 min | dev |
| 3 | SIWE domain/expiry validation | 30 min | dev |
| 4 | Security headers | 20 min | dev |
| 5 | Trim chat messages server-side | 15 min | dev |
| 6 | Rename session cookie | 5 min | dev |
| 7 | Remove legacy routes | 10 min | dev |
| 8 | Register EAS schema | 5 min | external |
| 9 | Get Alchemy/Infura API key | 5 min | external |
| 10 | Rebuild OG image route | 1-2 hr | dev |
| 11 | Add middleware | 30 min | dev |
| 12 | Deploy to Vercel | 30 min | ops |
| 13 | Register NOWPayments IPN URL | 5 min | external |
| 14 | Error monitoring | 30 min | dev |
