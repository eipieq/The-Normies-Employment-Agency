# thesis abstract (draft)

**title:** Derived Agent Personalities: Grounding, Ownership, and Homogeneity in LLM-Based Builders

**status:** draft. author: Anil Kumar, Madras School of Economics. check word limit with advisor before submission.

---

## abstract

Large language model agents are increasingly used as general-purpose coding and creative partners, yet default system configurations produce homogeneous outputs: similar tone, similar assumptions, and interchangeable "helpful assistant" behavior. We characterize this failure mode as *agent output homogeneity*: technically competent responses that lack stable, differentiated identity. Hand-written persona prompts partially address this problem but do not scale, are difficult for non-expert users to author, and rarely connect identity to persistent ownership or provenance.

This thesis investigates **derived agent personalities**: structured identity artifacts generated from external, verifiable data and deployed as portable system prompts across agent interfaces. We formalize personality as a multi-component artifact comprising voice, role, behavioral constraints, strengths, blind spots, and a canonical system prompt, rather than as ad hoc chat styling. Our approach separates **identity generation** (deterministic feature extraction plus constrained language-model synthesis) from **identity deployment** (ownership-gated access and export into third-party agent environments).

We implement and evaluate this framework through Normie Works, a production system that derives coworker personas from on-chain NFT attributes—including visual, trait-level, and edit-history signals—and gates full personality access via cryptographic wallet authentication. Public surfaces expose a shareable character card; private surfaces deliver the complete system prompt and an in-app conversational agent. We study (1) **distinctiveness** across tokens, (2) **consistency** of voice within and across sessions, (3) **grounding fidelity** to source attributes, and (4) **downstream utility** when holders import personas into vibecoding workflows versus generic baselines.

Our results suggest that personality is most effectively treated not as model fine-tuning alone, but as an **identity layer** in the agent stack: generated, provenance-linked, and portable. This work contributes a pipeline for grounded persona synthesis, an ownership model for holder-specific agent identity, and empirical evidence on whether derived personalities reduce homogeneity and improve user-agent collaboration in semi-technical builder settings. We discuss implications for NFT holder utility, creator tooling, and the design of future agent platforms where character is a first-class primitive.

---

## research question

Can agent personality be treated as a grounded, ownership-linked artifact—generated from verifiable data and exported across tools—rather than as generic system-prompt prose?

---

## planned contributions (for committee)

1. A formal decomposition of agent personality into generatable, evaluable components.
2. A pipeline combining deterministic feature extraction and temperature-0 LLM synthesis with version-keyed caching.
3. An ownership-gated release model linking persona access to on-chain holder identity.
4. Empirical analysis of distinctiveness, consistency, grounding fidelity, and builder utility vs generic baselines.

---

## system reference

production implementation: https://normies.sandpark.co

product thesis (non-academic): see PRODUCT.md

latex: `thesis/abstract.tex` (compile with `tectonic thesis/abstract.tex` → `thesis/abstract.pdf`)
