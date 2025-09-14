// app/api/github/adr/check/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit, getOctokitOptional } from "@/lib/github";


export async function GET(req: Request) {
	const url = new URL(req.url);
	const owner = url.searchParams.get("owner");
	const repo = url.searchParams.get("repo");
	if (!owner || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

	const session = await getServerSession(authOptions as any);
	const token = session && (session as any).accessToken ? (session as any).accessToken : undefined;
	const octokit = token ? getOctokit(token) : getOctokitOptional();
	for (const p of ["adr", "docs/adr", "docs/decisions"]) {
		try {
			await octokit.repos.getContent({ owner, repo, path: p });
			return NextResponse.json({ hasAdr: true, path: p });
		} catch (e: any) {
			const msg = e?.message || "";
			if (e?.status === 403 && /rate limit/i.test(msg)) {
				return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
			}
			// if 404 continue
		}
	}
	return NextResponse.json({ hasAdr: false, path: null });
}
