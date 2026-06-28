# product thesis

personality as holder utility. nft-backed agent identity for the vibecoding era.

live proof: https://normies.sandpark.co (built for the normies hackathon).

---

## output homogeneity

generic agents share the same brief, same taste, same voice. vibecoding amplifies that because the default stack (cursor, claude, etc.) starts from zero personality every time. you get working code with no soul.

the gap isn't capability. it's character. every project gets the same polite generalist unless the builder manually writes a persona, and most don't.

---

## why nft creators are the right distribution

creators already owe holders something ongoing. most experiments are cosmetic (merch, discord roles) or financial (staking).

a **usable agent identity** is a new utility class. not art you look at. a coworker you build with.

that maps directly to the semi-technical holder who'd vibecode a tool if they had a character to anchor it. they don't need a dev anymore. they need a personality layer that breaks homogeneity.

---

## what normies.sandpark.co proves

it's not just "job title from traits." the deliverable is three things:

1. **derived persona** grounded in on-chain identity. for normies: pixels, traits, canvas history. fed through a placement pipeline into job title, work style, strengths, blind spots, and a full system prompt.
2. **ownership-gated access** via SIWE. the personality unlock follows the wallet. when the nft sells, the new owner gets the surface. the old owner keeps whatever they already copied. that's fine.
3. **portable system prompt** the owner can drop into cursor, claude projects, openclaw, or whatever agent surface they're vibecoding on.

the normie isn't decoration on the agent. the normie *is* the agent's personality layer.

public surface: shareable employment card (viral, no wallet needed).
private surface: system prompt + in-app chat (owner only).

---

## the line

> every holder gets a unique coworker. not a generic assistant with a pfp. a persona derived from what they own, that only they can unlock.

differentiated by construction. two holders don't get the same voice unless they own the same token, and even then the dossier differs by token id and (for normies) canvas state.

---

## how this scales beyond normies

normies is the deepest version because api.normies.art gives pixel bitmap, canvas edit history, and a custom trait schema.

other collections get a **lighter dossier** (traits, metadata, rarity, static art) but the **same product shape**:

- public card (viral, proves the vibe)
- gated system prompt (the thing you import)
- optional in-app chat (demo + retention)
- roster for the connected wallet

each collection becomes a **personality franchise**. creator sponsors or co-brands the generator. holders get the utility. we run the pipeline.

technical shape: collection adapters behind shared routes.

```
/collections/normies/works/[id]
/collections/azuki/works/[id]
```

each adapter implements: load dossier, check ownership, list holdings, image url. normies adapter is what we ship today. erc-721 collections use metadata + indexer APIs (alchemy, reservoir, etc.) instead of the normies api.

---

## what to sharpen next

three moves turn a hackathon demo into a platform story:

1. **export path.** make "copy system prompt" feel like "install your coworker." one-click formats for cursor rules, claude project instructions, openclaw skill, etc.
2. **creator dashboard.** let a collection team configure brief voice, trait emphasis, banned tones. they keep brand, we keep infra.
3. **proof for semi-technical holders.** a short "build your first thing with your normie" template. todo app, landing page, research bot. show homogeneous default vs derived persona side by side.

---

## honest constraints

ownership gating stops casual copying, not determined leakers. the value is **provenance + unlock + creator-endorsed canon**, not drm on text.

persona cache is keyed by token id + canvas version for normies. other collections need their own cache key (metadata hash, trait snapshot, etc.).

we don't build our own indexer. we mirror ownership at request time for gating. we don't do multi-chain. ethereum mainnet only for now.

---

## wedge summary

**problem:** vibecoded agents are homogeneous because they have no personality.
**distribution:** nft creators need ongoing holder utility; holders are semi-technical builders.
**solution:** on-chain dossier → unique system prompt → owner-gated, portable agent identity.
**proof:** the normies employment agency / normie works.
**expansion:** same product, thinner data layer, per-collection adapters and creator-configured voice.
