// app/api/github/repos/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";

export async function GET() {
  const session = await getServerSession(authOptions as any);

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const octokit = new Octokit({ auth: (session as any).accessToken });
    // Trae hasta 100 repos (ajusta paginación si hace falta)
    const { data } = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
    // Aseguramos que devolvemos un array (data ya es array si todo OK)
    return NextResponse.json(data);
  } catch (err: any) {
    // Log en el servidor para debug
    console.error("Error fetching repos:", err);
    return NextResponse.json(
      { error: "GitHub API error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
