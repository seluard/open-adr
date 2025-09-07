"use client";

import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Sidebar({ onSelectRepo }: { onSelectRepo: (repo: any) => void }) {
  const { data, error } = useSWR("/api/github/repos", fetcher);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (error) return <div className="p-4 text-red-500">Error loading repositories: {String(error)}</div>;
  if (!data) return <div className="p-4">Loading repositories...</div>;

  // Quick debug: if the API returned an error object, show it
  if (!Array.isArray(data)) {
    console.error("API /api/github/repos returned:", data);
    const msg = data?.error || data?.message || "Unexpected server response";
    return <div className="p-4 text-yellow-700">Could not fetch repositories: {msg}</div>;
  }

  return (
  <aside className="w-64 h-screen p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-6 text-black uppercase">Repositories</h2>
      <ul className="space-y-3 pb-2 pr-1">
        {data.map((repo: any) => (
          <li
            key={repo.id}
            onClick={() => { setSelectedId(repo.id); onSelectRepo(repo); }}
            className={`cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-gray-100 shadow ${
              selectedId === repo.id ? "bg-gray-200 font-bold ring-2 ring-gray-300" : ""
            }`}
          >
            <div className="font-semibold text-base">{repo.name}</div>
            <div className="text-xs text-gray-500">{repo.full_name}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
