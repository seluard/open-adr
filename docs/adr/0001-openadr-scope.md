---
status: accepted
date: 11-09-2025
decision-makers: @seluard
---

# Open‑ADR scope and initial architecture (accepted)

## Context

Teams keep ADRs scattered across many repositories with different folder conventions. We need a simple, read‑only web app to discover and browse ADRs in any GitHub repo without enforcing a specific template or storage path.

## Decision

Build Open‑ADR as a read‑only ADR explorer with:

- Next.js (App Router) + TypeScript for the UI and server routes
- NextAuth with the GitHub provider for sign‑in (read‑only scopes)
- Tailwind CSS for styling
- GitHub REST API for repository and content access
- Default deployment on Vercel, with a documented self‑hosting option (Node/Docker)
- Support for common ADR folder conventions: `docs/adr`, `docs/decisions`, and `adr`
- Lightweight front‑matter parsing for metadata (status, date, decision‑makers, consulted, informed)

## Consequences

Pros:

- Minimal friction: no data store, fetch on demand from GitHub
- Easy to deploy (Vercel) and easy to self‑host
- Works with multiple common ADR folder layouts

Cons:

- Read‑only by design; authors edit ADRs in their own repos
- Rate‑limited by GitHub API; heavy use may require caching later

## Notes

This ADR establishes the foundation. Later ADRs refine metadata parsing and folder handling while keeping the viewer read‑only.

