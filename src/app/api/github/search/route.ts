// app/api/github/search/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit, getOctokitOptional } from "@/lib/github";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const per_page = Math.min(Number(url.searchParams.get("per_page") || 10), 30);
  if (!q || q.length < 3) return NextResponse.json({ items: [] });

  const session = await getServerSession(authOptions as any);
  const token = session && (session as any).accessToken ? (session as any).accessToken : undefined;
  const octokit = token ? getOctokit(token) : getOctokitOptional();
  try {
    const res = await octokit.search.repos({ q, per_page });
    return NextResponse.json(res.data);
  } catch (err: any) {
    const msg = err?.message || "";
    if (err?.status === 403 && /rate limit/i.test(msg)) {
      return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "GitHub API error", message: msg }, { status: 500 });
  }
}
