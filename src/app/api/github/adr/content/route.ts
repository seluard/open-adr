// app/api/github/adr/content/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit, getOctokitOptional } from "@/lib/github";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const owner = url.searchParams.get("owner");
	const repo = url.searchParams.get("repo");
	let filepath = url.searchParams.get("path");
	if (filepath) {
		filepath = decodeURIComponent(filepath);
	}
	if (!owner || !repo || !filepath) return NextResponse.json({ error: "Missing params" }, { status: 400 });

	const session = await getServerSession(authOptions as any);
	const token = session && (session as any).accessToken ? (session as any).accessToken : undefined;
	const octokit = token ? getOctokit(token) : getOctokitOptional();
	try {
		const res = await octokit.repos.getContent({ owner, repo, path: filepath });
		const data = res.data as any;
		const content = Buffer.from(data.content, "base64").toString("utf8");
		return NextResponse.json({ content, name: data.name, path: data.path });
	} catch (err: any) {
		const msg = err?.message || "";
		if (err?.status === 403 && /rate limit/i.test(msg)) {
			return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
		}
		return NextResponse.json({ error: "Error fetching file", message: err.message }, { status: 500 });
	}
}
