---
title: Test new folder of decisions
date: 11-09-20025
status: proposed
tags: [test, adr]
---
## Context

Hardcoding one or a few folders misses valid ADRs and creates maintenance overhead. Some repositories also use custom front‑matter keys.

## Decision

Implement an auto‑discovery strategy that:

- Searches a small set of common paths (`docs/adr`, `docs/decisions`, `adr`) and falls back to a recursive scan with a safe depth limit
- Recognizes markdown files whose names match common ADR patterns (e.g., `0001-*.md`)
- Parses front‑matter keys beyond the basics (e.g., `decision-makers`, `consulted`, `informed`) without enforcing strict schemas

## Consequences

Pros:

- Higher hit rate across diverse repositories
- More complete metadata in the UI cards

Cons:

- Slightly slower initial discovery without caching
- More parsing logic to maintain

## Status rationale

Proposed as a forward path to replace the fixed path list in ADR 0004.
