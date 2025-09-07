"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AdrDetail() {
  const params = useParams() as any;
  const owner = params.owner;
  const repo = params.repo;
  // path es un array por catch-all; en useParams viene como string con '/'. En Next 13, la ruta catch-all expresa diferente; adaptalo:
  const pathParts = params.path ? (Array.isArray(params.path) ? params.path : [params.path]) : [];
  const filepath = pathParts.join("/");

  const [content, setContent] = useState<string>("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/github/adr/content?owner=${owner}&repo=${repo}&path=${encodeURIComponent(filepath)}`);
      const json = await res.json();
      setContent(json.content || "");
    }
    if (filepath) load();
  }, [owner, repo, filepath]);

  if (!filepath) return <div>Archivo no especificado</div>;
  if (!content) return <div>Cargando contenido...</div>;

  return (
    <div className="prose p-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
