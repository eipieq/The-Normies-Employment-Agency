# progress

session-by-session log. newest entry at top. read this when starting any session.

format: date, agent, what shipped, what's next, blockers.

---

## 2026-05-20 (claude)

shipped:

- locked the concept: the normie employment agency (umbrella) + normie works (first feature, artwork-to-ai-persona generator)
- wrote PLAN.md (architecture, pipeline, 9 phases, risks)
- wrote DESIGN_BRIEF.md (what visual elements are needed and when)
- set up handoff scaffolding: AGENTS.md, CLAUDE.md, .cursorrules
- added MIT LICENSE (hackathon requirement)
- git init, first commit

next:

- **phase 1: foundation**. scaffold next.js 16 + tailwind + shadcn + typescript. link vercel project. install wagmi, viem, rainbowkit, ai sdk + anthropic provider, iron-session. configure shadcn theme to match the design guide.
- needs decision before kicking off: package manager (pnpm recommended for this stack). env vars: walletconnect project id, anthropic api key, kv creds will be needed but can be stubbed for local until phase 3.

blockers:

- none. agency wordmark from anil is not blocking phase 1 (can stub the header and theme).
