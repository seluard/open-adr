// app/api/github/adr/list/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit } from "@/lib/github";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  const path = url.searchParams.get("path") || "adr";
  if (!owner || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const session = await getServerSession(authOptions as any);
  if (!session || !(session as any).accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const octokit = getOctokit((session as any).accessToken);
  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const arr = Array.isArray(res.data) ? res.data : [res.data];
    const md = arr.filter((f: any) => f.type === "file" && f.name.endsWith(".md")).map((f: any) => ({
      name: f.name,
      path: f.path,
      sha: f.sha,
      download_url: f.download_url
    }));
    return NextResponse.json(md);
  } catch (err: any) {
    return NextResponse.json({ error: "No ADR folder or API error", message: err.message }, { status: 404 });
  }
}
