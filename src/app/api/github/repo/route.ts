// app/api/github/repo/route.ts
import { NextResponse } from "next/server";
import { getOctokitOptional } from "@/lib/github";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner") || process.env.NEXT_PUBLIC_REPO_OWNER || "seluard";
  const repo = url.searchParams.get("repo") || process.env.NEXT_PUBLIC_REPO_NAME || "open-adr";

  try {
    const octokit = getOctokitOptional();
    const { data } = await octokit.repos.get({ owner, repo });
    return NextResponse.json({
      name: data.name,
      full_name: data.full_name,
      stargazers_count: data.stargazers_count,
      html_url: data.html_url,
      owner: data.owner?.login,
    });
  } catch (err: any) {
    const msg = err?.message || "";
    if (err?.status === 403 && /rate limit/i.test(msg)) {
      return NextResponse.json({ error: "GitHub rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "GitHub API error", message: msg }, { status: 500 });
  }
}
