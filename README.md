# Open-ADR

![Open-ADR Logo](public/logo.png)


> Discover, browse & (soon) manage Architecture Decision Records across your GitHub repositories.  
> *Status: Experimental – validating community interest before expanding authoring & management features.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fseluard%2Fopen-adr)

---

## Why Open-ADR?

Engineering teams write Architecture Decision Records (ADRs) but they often become siloed inside individual repositories, hard to find, compare, or evolve. Open-ADR provides a unified, minimal UI (initially read‑only) to:

* Quickly see if a repo uses ADRs and where they live.
* List all ADRs (supports common folder conventions: `docs/adr/`, `docs/decisions/`).
* View ADR markdown with front‑matter status extraction (e.g. `proposed`, `accepted`, `rejected`, `deprecated`, `superseded by ...`).
* Normalize status values for consistent scanning.
* Prepare for future “management” capabilities: create, comment (via GitHub PRs), supersede, and dashboard views.

## Current Scope (MVP)

| Area | Included Now | Planned Next |
|------|--------------|--------------|
| Authentication | GitHub OAuth via NextAuth | Fine‑grained token scopes |
| ADR Detection | `docs/adr/`, `docs/decisions/` | Custom path config |
| Listing | Status + basic metadata | Search / filters / tags |
| Viewing | Render markdown (GitHub content) | In‑place diff / history |
| Status Parsing | Front‑matter YAML `status:` | Validation + linter rules |
| Creation / Editing | (Not yet) | Create ADR (scaffold) |
| Collaboration | (Not yet) | Comment via PR / Discussion |
| Org Visibility | Single repo at a time | Org / multi-repo dashboard |
| Management | (Future) | Supersede / archive flows |

## Roadmap (High-Level – subject to change)

1. Create ADR from UI (opens PR with markdown scaffold)
2. Commenting workflow (maps to GitHub PR or issue discussion)
3. Search & filter (status, text, date range)
4. Organization / multi-repo dashboard
5. Supersede & deprecate helpers
6. Export / API (JSON feed of ADR metadata)
7. Optional lint / validation (status vocabulary, front‑matter completeness)
8. Role-based quick insights (recent changes, stale ADRs)

If any of these resonate (or you want something else), open an issue and describe your use case.

## Architecture (Brief)

* **Next.js App Router** (TypeScript) serving UI + API routes.
* **NextAuth (GitHub provider)** obtains an OAuth access token (scopes: `repo read:user read:org`).
* **GitHub REST API (@octokit/rest)** used server-side only – the browser never sees your token.
* **ADR Resolution Logic**: Attempts folder candidates in order: `docs/adr`, `docs/decisions`, `adr`.
* **Status Extraction**: Regex pulls YAML front‑matter; unrecognized values become `unknown`.

## Getting Started (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/seluard/open-adr.git
cd open-adr
npm install   # or: pnpm install / yarn install / bun install
```

### 2. Create a GitHub OAuth App

1. Go to: GitHub Settings → Developer settings → OAuth Apps → New OAuth App.
2. Callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID & Client Secret.

### 3. Configure Environment

Create a `.env.local` file:

```bash
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=generate_a_long_random_string
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret (example):

```bash
openssl rand -base64 48
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit: <http://localhost:3000> and sign in with GitHub.

### 5. Try It

Use the UI to point at any repository you have access to that contains ADRs in one of the supported folders.

## Deploy on Vercel

Open-ADR is a Next.js App Router app and works great on Vercel.

* Click the button at the top or go here: <https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fseluard%2Fopen-adr>
* When prompted, set environment variables:
	* `GITHUB_ID` – GitHub OAuth App Client ID
	* `GITHUB_SECRET` – GitHub OAuth App Client Secret
	* `NEXTAUTH_SECRET` – a long random string
	* `NEXTAUTH_URL` – your Vercel URL (e.g. `https://<your-project>.vercel.app`)

GitHub OAuth callback URL:

* Set the OAuth App “Authorization callback URL” to: `https://<your-project>.vercel.app/api/auth/callback/github`.
* Preview deployments have different domains; GitHub OAuth Apps allow only one callback URL. For smooth dev + prod:
	* Option A (recommended): create a second OAuth App for production with the Vercel domain (keep your local one for `localhost`).
	* Option B: update the single OAuth App callback when switching between local and production.

After the first deploy, you can attach the project to your repo for CI/CD and preview deployments (note: previews won’t authenticate unless the callback matches).

## Self‑Hosting

You can run Open-ADR on your own infrastructure. Two common ways are shown below.

### Option A: Manual (Node.js)

Prerequisites:

* Node.js 18+ (or a compatible runtime used by Next.js 14+)
* A public URL (domain) and TLS termination (e.g., behind Nginx, Caddy, or a cloud load balancer)

Steps:

1. Configure environment variables on your host:

```bash
GITHUB_ID=your_client_id
GITHUB_SECRET=your_client_secret
NEXTAUTH_SECRET=generate_a_long_random_string
NEXTAUTH_URL=https://adr.example.com
```

1. Build and start:

```bash
npm install
npm run build
npm start
```

1. In your GitHub OAuth App, set the Authorization callback URL to:

```text
https://adr.example.com/api/auth/callback/github
```

Optional Nginx reverse proxy snippet:

```nginx
server {
	server_name adr.example.com;

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

### Option B: Docker

If you prefer containers, you can use a simple Dockerfile like this (save as `Dockerfile` in the repo):

```dockerfile
# --- build stage ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- run stage ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t open-adr:latest .
docker run --rm -p 3000:3000 \
	-e GITHUB_ID=your_client_id \
	-e GITHUB_SECRET=your_client_secret \
	-e NEXTAUTH_SECRET=generate_a_long_random_string \
	-e NEXTAUTH_URL=https://adr.example.com \
	open-adr:latest
```

Then configure your reverse proxy / TLS to expose `https://adr.example.com` to users.

## Folder Conventions Supported

| Folder | Example | Notes |
|--------|---------|-------|
| `docs/adr/` | `docs/adr/0001-first-decision.md` | Preferred if you keep docs grouped |
| `docs/decisions/` | `docs/decisions/0002-something.md` | Common alternate |

## Example ADR Front-Matter

```yaml
---
status: accepted
date: 2025-09-11
decision-makers: team-architecture
---
```
 
Unrecognized status values are shown as `unknown` (for now).

## ADR / MADR Standards & Templates

Open-ADR aims to interoperate with the most common community conventions so teams do not have to reinvent formats. Planned authoring & validation features will lean on:

* **Original ADR concept** – Popularized by Michael Nygard ("Documenting Architecture Decisions").
* **Community ADR templates & examples** – See <https://github.com/joelparkerhenderson/architecture_decision_record>.
* **MADR (Markdown Any Decision Records)** – Structured, opinionated template: <https://github.com/adr/madr>.

### Alignment Strategy

When creation & management land, Open-ADR will provide:

* A selectable template (Classic ADR vs MADR flavor).
* Normalized front‑matter keys (at minimum): `status`, `date`, `deciders` (or `decision-makers`), `context`, `decision`, `consequences`, `supersedes`, `superseded-by`.
* Status vocabulary alignment (mapping variants like `proposed`/`accepted`/`rejected`/`deprecated`/`superseded by <ADR>`).
* Optional validation pass (schema-like check) to surface missing required sections before opening a PR.

### Future Schema (Draft Direction)

Below is an indicative YAML front‑matter superset Open-ADR may validate against (NOT enforced yet):

```yaml
---
id: 0005
title: Short, imperative decision title
status: proposed # proposed | accepted | rejected | deprecated | superseded | superseded by <id>
date: 2025-09-11
deciders: [team-architecture]
consulted: [security, platform]
informed: [engineering]
supersedes: 0001
superseded-by: null
tags: [architecture, data]
---
```

The body then follows the familiar sections (MADR style):

```text
# Context and Problem Statement
# Decision Drivers
# Considered Options
# Decision Outcome
# Pros and Cons of the Options
# Links / References
```

Feedback welcome—open an issue if your organization uses additional structured fields (e.g. risk, owner, review-date) that should be first‑class.

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `GITHUB_ID` | Yes | GitHub OAuth App Client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth App Client Secret |
| `NEXTAUTH_SECRET` | Yes | Session / JWT encryption |
| `NEXTAUTH_URL` | Recommended (esp. in deploy) | Absolute canonical app URL |

## Security / Privacy

* Access tokens stay server-side via NextAuth; they are not exposed to the browser.
* Only read operations are performed in the MVP.
* No data is persisted outside user session memory (no database yet or planned).
* For disclosure of a security concern: please open an issue with minimal details first or email maintainer

## Contributing (Early Stage)

The direction is still being validated. For now:

1. Open an issue describing the problem / idea before starting any PR.
2. Provide context (why it helps teams managing ADRs).
3. Wait for maintainers to green-light before significant work.

Larger contribution guidelines & a CONTRIBUTING.md will appear once scope stabilizes.

### Code of Conduct

This project adheres to the CNCF Code of Conduct: <https://github.com/cncf/foundation/blob/main/code-of-conduct.md>  
By participating, you agree to uphold it.

## Philosophy & License Choice

Open-ADR is licensed under **AGPLv3** to ensure improvements made while offering it as a network service remain available to the community. If you fork and run a modified version publicly, you must make the modified source available under the same terms.

See: [LICENSE](./LICENSE)

## FAQ

**Why not support editing now?** – Validating discovery & read use-cases comes first; authoring flows add complexity (PR generation, templates, validation).

**Will you support GitLab?** – GitHub first. GitLab / others could be added (the dependency `@gitbeaker/node` is already present, signaling possible future integration).

**Does it store ADRs?** – No; it fetches from Git-hosted repositories on demand.

**Is there a public demo?** – Not yet. Planned after initial feedback.

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Lint codebase |

## Potential Future Enhancements

* ADR template scaffolding (configurable headers)
* Supersede action (auto-insert links both ways)
* Org-wide heatmap of ADR activity
* Subscription / notification hooks (new or changed ADRs)
* Status aging warnings (e.g. long-lived proposed decisions)
* API token / service account mode

## You Can Help

The most valuable help right now:

* Try it against real repositories.
* Report friction or missing metadata.
* Share how your team organizes ADRs (folder, naming, front‑matter fields).

## Disclaimer

Experimental software. Interfaces and data structures may change without notice until a 0.2.x milestone is tagged.

---

If this project is useful, starring the repository helps gauge interest and prioritize the roadmap. Thank you for exploring Open-ADR.
