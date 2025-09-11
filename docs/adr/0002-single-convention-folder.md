---
title: Test new folder of decisions
date: 11-09-20025
status: deprecated
tags: [test, adr]
---
## Context

To reduce complexity early on, we considered standardizing on a single ADR folder path (`docs/adr`) across repositories. This would make discovery simple, at the cost of excluding other common conventions.

## Decision

Adopt a single convention and look for ADRs only in `docs/adr`.

## Consequences

Pros:

- Simple implementation and predictable lookups
- Low maintenance

Cons:

- Misses ADRs stored under other common paths (`docs/decisions`, `adr`)
- Forces teams to reorganize existing repos

## Status rationale

Deprecated in favor of supporting multiple common locations and later auto‑discovery. See ADR 0004 and ADR 0005.
