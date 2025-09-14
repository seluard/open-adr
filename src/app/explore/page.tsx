"use client";

import AdrBrowser from "@/components/AdrBrowser";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function ExploreInner() {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner") || undefined;
  const repo = searchParams.get("repo") || undefined;
  return <AdrBrowser defaultPublic={true} initialOwner={owner} initialRepo={repo} />;
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreInner />
    </Suspense>
  );
}

