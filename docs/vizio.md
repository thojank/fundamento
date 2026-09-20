# Vizio – Brands become software

*Why Fundamento starts with a data model, conjunction sets and rulings instead of a component library.*

## The question changed

The first question was an operational one: how do we bring a new brand into a multi-brand design system without rebuilding it by hand? Shared core plus brand themes answered part of it. Colors, type, spacing, radius and motion became parameters of one system.

The question today is larger: **how must a brand be described so that people and AI systems can understand it, apply it, check it and run it consistently across any touchpoint, including ones nobody designed in advance?**

Interfaces are starting to be generated from intent, context, data and rules. A screen may not exist until a user asks for it. Brand guidelines as a PDF cannot govern that. A classic design system, written for humans, cannot either. What is needed is a brand that is **specified, versioned and executable**.

> The future of branding is not generating more brand assets. It is making the brand itself executable.

## From identity to specification

A brand is more than a visual skin. It has layers: purpose and positioning, personality, visual identity, experience (layout, density, motion, interaction), communication (voice, vocabulary), and behavior: how it adapts to situations and what it may and may not do. Each layer can be described as data plus rules with reasons.

| Classic chain | Executable chain |
|---|---|
| Strategy → identity → guidelines PDF → design system → templates → products | Strategy → brand specification → machine-readable model → runtime → generated experiences |

In the executable chain, the brand is not documented after the fact. It is the source, and everything else is derived from it and checked against it.

## How Fundamento implements this

| Idea | Fundamento today |
|---|---|
| Machine-readable brand model | **Modelo**: one canonical data model; tokens in W3C DTCG only |
| A brand as a package | **Aspekto**: a complete assignment of the Vortaro, shipped as its own package with its own license; the visual layer (`vida`) is the first of several **Tavoloj** |
| Adaptation to situations | **Dimensioj**: color scheme, contrast, density, viewport, motion, and further dimensions through data alone |
| Rules with reasons | **Regularo**: every rule carries its **kialo**; decisions are kept as **Jugxoj** (precedents) |
| Brand runtime | **MCP server**: any agent asks what exists, what a value is in a given situation, why, and whether a choice conforms |
| Versioning and CI/CD for brands | stable IDs, deterministic byte-identical exports, conformance checks on every change |
| Brand interpretation | the first derived brand in Fundamento was built by documented rules from a public website, each step recorded, each finding turned into a rule |

## Principles we hold

1. **Specification over assets.** A file that cannot be checked is not a brand, it is a picture of one.
2. **Rules carry reasons.** A constraint without a kialo is invalid. Agents cite reasons, not taste.
3. **Findings become rules.** Every problem a human reviewer finds that no check found becomes a rule with a reason, and where it can be measured, an automatic check.
4. **Thresholds are never lowered.** A brand adapts to accessibility, not the other way round.
5. **Clean room.** Other systems are benchmarks for requirements, never sources of content.
6. **Agents first, humans always.** The model is built for machines to read; people decide meaning, positioning, taste and direction.

## Humans and machines

The aim is not that AI replaces brand designers. The model is **human direction, machine exploration, machine execution, human judgment**. People decide meaning, cultural relevance, differentiation and taste. Machines research, explore variants, check consistency, document, transform and implement. Brand design moves from asset creation to **system direction**.

## Fluid brands: the brand follows the context

A multi-brand system usually means many brands living side by side, each in its own product. The harder and more valuable case is different: **the brand follows the context, not the provider.**

In brand groups with a hundred brands and more, this has been the goal for years, and it is the problem the founder of Fundamento worked on in his previous design-system role. A viewer pauses a film in the entertainment service and buys the sweater the lead actor wears; the purchase runs through the fashion service, but it looks like the entertainment service. A visitor buys a ticket in the portal of a heritage site and pays with the group's payment service; the payment looks like the heritage site, not like the payment brand.

Fundamento calls this a **fluid brand**. Components are brand-agnostic: they know the vocabulary, never a brand. The system is multi-brand: many brands, each complete, none a skin over another. The runtime is context-adaptive: which brand governs which roles is decided by the situation, through a precedence rule that is data, carries a reason and can be queried.

Three cases follow from it:

- **Family:** sub-brands are derived from a parent brand by documented rules and shipped as complete brands, so a change to the parent regenerates every child.
- **Host wins:** an embedded service takes the brand of the place it appears in. The shared vocabulary is the contract; the brand is only the assignment of values.
- **Guest wins, in permitted roles:** a sponsor's brand is laid over the host for a time and a place, with consent, and withdrawn afterwards.

One limit holds in every case: **trust and safety do not flow.** Payment confirmations, security marks, the name of the payment provider, warnings and safety-relevant information never take another brand's values. If a payment form can wear any brand, a user can no longer tell a real payment from a fake one.

## Where this leads

The design system is not the end product. It is the first executable projection of a brand specification. Next come context-dependent behavior at runtime (a brand that is calm in the morning and warm in the evening, within its rules), a formal ontology so every export is also a knowledge graph, and tooling that creates new brands through an iterative, rule-bound process in which every iteration is a valid, complete brand rather than a mood board. Brands will be described in words and rules, steered by examples and generated; configured step by step, or imported from examples and links for a client's commission, applied in that client's context rather than copied.

In one sentence: **brands become software.**
