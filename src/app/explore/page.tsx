"use client";

import AdrBrowser from "@/components/AdrBrowser";
import { useSearchParams } from "next/navigation";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner") || undefined;
  const repo = searchParams.get("repo") || undefined;
  return <AdrBrowser defaultPublic={true} initialOwner={owner} initialRepo={repo} />;
}

