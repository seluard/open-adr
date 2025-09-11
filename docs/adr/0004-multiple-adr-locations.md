---
title: Test new folder of decisions
date: 11-09-20025
status: superseded by 0005
tags: [test, adr]
---
## Context

Repositories often store ADRs in different locations. To support more teams, we evaluated expanding resolution beyond `docs/adr` to include `docs/decisions` and `adr`.

## Decision

Introduce support for multiple common ADR directories. Initially keep a fixed list of supported paths and select the first match in a repository.

## Consequences

Pros:

- Works with more repositories without forcing a single convention
- Minimal code changes vs. a full discovery mechanism

Cons:

- Fixed list can still miss custom locations
- Lacks heuristics and can’t combine results across paths

## Status rationale

Superseded by ADR 0005, which proposes auto‑discovery and smarter handling of ADR locations.
