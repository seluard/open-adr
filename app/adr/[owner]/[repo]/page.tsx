"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AdrList() {
  const params = useParams() as any;
  const owner = params.owner;
  const repo = params.repo;
  const [files, setFiles] = useState<any[] | null>(null);

  useEffect(() => {
    async function load() {
      const check = await fetch(`/api/github/adr/check?owner=${owner}&repo=${repo}`).then(r => r.json());
      if (!check.hasAdr) { setFiles([]); return; }
      const list = await fetch(`/api/github/adr/list?owner=${owner}&repo=${repo}&path=${encodeURIComponent(check.path)}`).then(r => r.json());
      setFiles(list);
    }
    load();
  }, [owner, repo]);

  if (files === null) return <div>Cargando ADRs...</div>;
  if (files.length === 0) return <div>No se han encontrado ADRs</div>;

  return (
    <div className="p-8">
      <h2 className="text-lg font-bold">ADRs en {owner}/{repo}</h2>
      <ul className="mt-4">
        {files.map(f => (
          <li key={f.path} className="py-2">
            <a className="text-blue-600" href={`/adr/${owner}/${repo}/${encodeURIComponent(f.path)}`}>{f.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
