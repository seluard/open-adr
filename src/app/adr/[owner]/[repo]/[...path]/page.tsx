"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AdrDetail() {
	const params = useParams() as Record<string, string | string[]>;
	const owner = params.owner;
	const repo = params.repo;
	// path is an array for catch-all; in useParams it comes as string with '/'. In Next 13, catch-all route behaves differently; adapt it:
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

	if (!filepath) return <div>File not specified</div>;
	if (!content) return <div>Loading content...</div>;

	return (
		<div className="prose prose-slate max-w-none p-8 mx-auto">
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
		</div>
	);
}
