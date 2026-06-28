# experiment fork

this directory is a **git worktree** on branch `experiment/collections`, forked from the normie product at `../the-normie-employment-agency`.

**normie prod stays untouched** on `main` at normies.sandpark.co. all multi-collection work happens here.

## what we're building

the employment agency as a **collection-agnostic platform**:

- `/collections/normies/works/[id]` — full pipeline (pixels, canvas, traits)
- `/collections/azuki/works/[id]` — lighter dossier (on-chain metadata + traits)

each collection is an adapter behind shared routes.

## dev setup

```bash
cd web
cp ../the-normie-employment-agency/web/.env.local .env.local   # if missing
pnpm install
pnpm dev
```

optional for azuki roster later: `ALCHEMY_API_KEY` in `.env.local`.

## deploy

separate vercel project recommended. do not point at normies.sandpark.co until intentional.
