// app/api/github/adr/list/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit, getOctokitOptional } from "@/lib/github";

function candidateFolders(): string[] {
	return [
		"docs/adr",
		"doc/adr",
		"docs/decisions",
		"doc/decisions",
		"docs/architecture/decisions",
		"architecture/decisions",
		"adr",
		"adrs",
		"decisions"
	];
}

function isRateLimited(err: any): boolean {
	const msg = err?.message || "";
	return err?.status === 403 && /rate limit/i.test(msg);
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const owner = url.searchParams.get("owner");
	const repo = url.searchParams.get("repo");
	if (!owner || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

	const session = await getServerSession(authOptions as any);
	const token = session && (session as any).accessToken ? (session as any).accessToken : (process.env.GITHUB_PUBLIC_TOKEN || undefined);
	const octokit = token ? getOctokit(token) : getOctokitOptional();

	const folders = candidateFolders();
	let collected: any[] = [];

	// 1) Try direct folder listings
	for (const path of folders) {
		try {
			const res = await octokit.repos.getContent({ owner, repo, path });
			const arr = Array.isArray(res.data) ? res.data : [res.data];
			const mdFiles = arr.filter((f: any) => f.type === "file" && /\.md$/i.test(f.name));
			if (mdFiles.length > 0) {
				if (token) {
					// Authenticated: attempt to parse status from frontmatter (may cost more requests)
					const mdWithMeta = await Promise.all(mdFiles.map(async (f: any) => {
						let status = "unknown";
						try {
							const fileRes = await octokit.repos.getContent({ owner, repo, path: f.path });
							const content = Buffer.from((fileRes.data as any).content, "base64").toString("utf8");
							const match = content.match(/---([\s\S]*?)---/);
							if (match) {
								const yaml = match[1];
								const statusMatch = yaml.match(/status:\s*(.*)/);
								if (statusMatch) {
									const rawStatus = statusMatch[1].trim();
									const validStatuses = ["proposed", "rejected", "accepted", "deprecated"];
									if (validStatuses.includes(rawStatus)) status = rawStatus;
									else if (/^superseded by \w+$/i.test(rawStatus)) status = rawStatus;
									else status = "unknown";
								}
							}
						} catch {}
						return { name: f.name, path: f.path, sha: f.sha, download_url: (f as any).download_url, status };
					}));
					collected = mdWithMeta;
				} else {
					// No token at all: minimal info only
					collected = mdFiles.map((f: any) => ({ name: f.name, path: f.path, sha: f.sha, download_url: (f as any).download_url, status: "unknown" }));
				}
				if (collected.length > 0) return NextResponse.json(collected);
			}
		} catch (err: any) {
			if (isRateLimited(err)) return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
			// else try next folder
		}
	}

	// 2) Fallback: scan the git tree for typical ADR directories
	try {
		// get default branch name and its commit sha
		const repoInfo = await octokit.repos.get({ owner, repo });
		const defaultBranch = (repoInfo.data as any).default_branch;
		if (defaultBranch) {
			const branchInfo = await octokit.repos.getBranch({ owner, repo, branch: defaultBranch });
			const commitSha = (branchInfo.data as any).commit?.sha || defaultBranch;
			const treeRes = await octokit.git.getTree({ owner, repo, tree_sha: commitSha, recursive: "true" as any });
			const entries = (treeRes.data.tree || []) as Array<any>;
			const dirPatterns = [
				/(^|\/)docs\/architecture\/decisions\//i,
				/(^|\/)architecture\/decisions\//i,
				/(^|\/)docs\/adr\//i,
				/(^|\/)doc\/adr\//i,
				/(^|\/)docs\/decisions\//i,
				/(^|\/)doc\/decisions\//i,
				/(^|\/)adr\//i,
				/(^|\/)adrs\//i,
				/(^|\/)decisions\//i
			];
			const mdFiles = entries.filter(e => e.type === "blob" && /\.md$/i.test(e.path) && dirPatterns.some((re) => re.test(e.path)));
			const mapped = mdFiles.map((e) => ({ name: e.path.split("/").pop(), path: e.path, sha: e.sha, download_url: null, status: token ? "unknown" : "unknown" }));
			if (mapped.length > 0) return NextResponse.json(mapped);
		}
	} catch (err: any) {
		if (isRateLimited(err)) return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
	}

	return NextResponse.json({ error: "No ADR folder found or API error" }, { status: 404 });
}
