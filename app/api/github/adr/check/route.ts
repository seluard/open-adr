// app/api/github/adr/check/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOctokit } from "@/lib/github";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner");
  const repo = url.searchParams.get("repo");
  if (!owner || !repo) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const session = await getServerSession(authOptions as any);
  if (!session || !(session as any).accessToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const octokit = getOctokit((session as any).accessToken);
  for (const p of ["adr", "docs/adr"]) {
    try {
      await octokit.repos.getContent({ owner, repo, path: p });
      return NextResponse.json({ hasAdr: true, path: p });
    } catch (e: any) {
      // if 404 continue
    }
  }
  return NextResponse.json({ hasAdr: false, path: null });
}
