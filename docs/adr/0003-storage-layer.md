---
title: Test new folder of decisions
date: 11-09-20025
status: rejected
tags: [test, adr]
---
## Context

We considered ingesting ADRs into a central database for faster searches and cross‑repo analytics. This would require background sync, webhooks, and a storage layer.

## Decision

Do not introduce a database. Keep the application read‑only and fetch ADRs directly from GitHub on demand.

## Consequences

Pros:

- Simpler architecture, fewer moving parts
- Lower hosting and operational cost

Cons:

- Live GitHub calls can be slower than a local index
- Cross‑repo search/analytics are limited without additional caching

## Status rationale

Rejected to maintain the project’s lightweight, read‑only nature. We may revisit caching if usage demands it.
