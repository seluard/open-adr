// app/api/github/adr/list/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit } from "@/lib/github";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const owner = url.searchParams.get("owner");
	const repo = url.searchParams.get("repo");
	const pathsToTry = ["docs/adr", "docs/decisions","adr"];
	if (!owner || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

	const session = await getServerSession(authOptions as any);
	if (!session || !(session as any).accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

	const octokit = getOctokit((session as any).accessToken);
	for (const path of pathsToTry) {
		try {
			const res = await octokit.repos.getContent({ owner, repo, path });
			const arr = Array.isArray(res.data) ? res.data : [res.data];
			const mdFiles = arr.filter((f: any) => f.type === "file" && f.name.endsWith(".md"));

			// Fetch and parse metadata for each ADR file
			const mdWithMeta = await Promise.all(mdFiles.map(async (f: any) => {
				let status = "unknown";
				try {
					const fileRes = await octokit.repos.getContent({ owner, repo, path: f.path });
					const content = Buffer.from((fileRes.data as any).content, "base64").toString("utf8");
					// Extract frontmatter (YAML between ---)
					const match = content.match(/---([\s\S]*?)---/);
					if (match) {
						const yaml = match[1];
						const statusMatch = yaml.match(/status:\s*(.*)/);
						if (statusMatch) {
							const rawStatus = statusMatch[1].trim();
							const validStatuses = ["proposed", "rejected", "accepted", "deprecated"];
							if (validStatuses.includes(rawStatus)) {
								status = rawStatus;
							} else if (/^superseded by \w+$/i.test(rawStatus)) {
								status = rawStatus;
							} else {
								status = "unknown";
							}
						}
					}
				} catch {}
				return {
					name: f.name,
					path: f.path,
					sha: f.sha,
					download_url: f.download_url,
					status
				};
			}));
			if (mdWithMeta.length > 0) return NextResponse.json(mdWithMeta);
		} catch (err: any) {
			// Try next path
		}
	}
	return NextResponse.json({ error: "No ADR folder or API error" }, { status: 404 });
}
