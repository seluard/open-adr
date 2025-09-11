"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar";
import ReactMarkdown from "react-markdown";
import { signIn, useSession } from "next-auth/react";
import Logo from "@/components/Logo";

export default function HomePage() {
	const { data: session } = useSession();
	const [selectedRepo, setSelectedRepo] = useState<Record<string, any> | null>(null);
	const [adrs, setAdrs] = useState<Array<{ sha: string; name: string; path: string; status?: string }> | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [selectedAdr, setSelectedAdr] = useState<{ sha: string; name: string; path: string } | null>(null);
	const [adrContent, setAdrContent] = useState<{
		frontMatter: string | null;
		metadata: Record<string, string>;
		content: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch ADRs when repo is selected
	useEffect(() => {
		if (selectedRepo) {
			setLoading(true);
			setAdrs(null);
			setSelectedAdr(null);
			setAdrContent(null);

			fetch(`/api/github/adr/list?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}`)
				.then((res) => res.json())
				.then((data) => {
					setAdrs(Array.isArray(data) ? data : []);
					setLoading(false);
				})
				.catch(() => {
					setAdrs([]);
					setLoading(false);
				});
		}
	}, [selectedRepo]);

	// Function to extract and parse front matter
	const extractFrontMatter = (content: string) => {
		if (content.startsWith("---")) {
			const lines = content.split("\n");
			const frontMatterLines: string[] = [];
			let foundEnd = false;

			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim() === "---") {
					foundEnd = true;
					break;
				}
				frontMatterLines.push(lines[i]);
			}

			if (foundEnd) {
				const frontMatterText = frontMatterLines.join("\n");
				const remainingContent = lines.slice(frontMatterLines.length + 2).join("\n");

				// Parse YAML-like content into key-value pairs
				const metadata: Record<string, string> = {};
				frontMatterLines.forEach((line) => {
					const trimmedLine = line.trim();
					if (trimmedLine && !trimmedLine.startsWith("#")) {
						const colonIndex = trimmedLine.indexOf(":");
						if (colonIndex > 0) {
							const key = trimmedLine.substring(0, colonIndex).trim();
							const value = trimmedLine
								.substring(colonIndex + 1)
								.trim()
								.replace(/^[["']|[["']]$/g, "");
							if (value) {
								metadata[key] = value;
							}
						}
					}
				});

				return { frontMatter: frontMatterText, metadata, content: remainingContent };
			}
		}
		return { frontMatter: null, metadata: {}, content };
	};

	// Fetch ADR content when selected
	useEffect(() => {
		if (selectedRepo && selectedAdr) {
			setAdrContent(null);
			setLoading(true);

			fetch(
				`/api/github/adr/content?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}&path=${encodeURIComponent(
					selectedAdr.path
				)}`
			)
				.then((res) => res.json())
				.then((data) => {
					const rawContent = data.content || "No ADR content available";
					const { frontMatter, metadata, content } = extractFrontMatter(rawContent);

					// Store the front matter, parsed metadata, and clean content
					setAdrContent({ frontMatter, metadata, content });
					setLoading(false);
				})
				.catch(() => {
					setAdrContent({ frontMatter: null, metadata: {}, content: "Error loading ADR" });
					setLoading(false);
				});
		}
	}, [selectedAdr, selectedRepo]);

	// Unauthenticated landing hero
	if (!session) {
		return (
			<div className="relative flex items-center justify-center h-[calc(100vh-2rem)] overflow-hidden rounded-3xl bg-white/70 dark:bg-white/60">
				{/* Decorative gradient blobs */}
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="absolute -top-24 -left-16 h-72 w-72 bg-gradient-to-tr from-indigo-300 via-blue-300 to-cyan-200 rounded-full blur-3xl opacity-60" />
					<div className="absolute -bottom-24 -right-16 h-72 w-72 bg-gradient-to-tr from-rose-300 via-fuchsia-300 to-purple-300 rounded-full blur-3xl opacity-60" />
				</div>

				<div className="relative z-10 flex flex-col items-center px-6 text-center">
					<div className="mb-8 flex flex-col items-center">
						<span className="inline-flex items-center rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur">
							Read‑only MVP • GitHub OAuth
						</span>
					</div>

					<h1 className="max-w-5xl text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
						<span className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700 bg-clip-text text-transparent">Make Decisions</span>
						<br className="hidden md:block" />
						<span className="text-gradient-shimmer">Discoverable.</span>
					</h1>

					<p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-8">
						Discover, browse and compare Architecture Decision Records across your GitHub repositories.
					</p>

					<div className="flex flex-col sm:flex-row items-center gap-3">
						<button
							onClick={() => signIn("github")}
							className="group inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white shadow-lg transition hover:shadow-xl active:translate-y-px"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
								<path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 0 0 8.21 11.43c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.74.08-.72.08-.72 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.62-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.15 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.85.12 3.15.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.61-5.49 5.91.43.37.81 1.1.81 2.22 0 1.6-.02 2.88-.02 3.27 0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
							</svg>
							Sign in with GitHub
						</button>
						<button
							onClick={() => window.open("https://github.com/seluard/open-adr", "_blank", "noopener,noreferrer")}
							className="inline-flex items-center rounded-xl border border-gray-300 bg-white/70 px-5 py-3 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white"
						>
							Learn more
						</button>
					</div>

					<p className="mt-6 max-w-xl text-sm text-gray-500">
						Supports common folders: <code>docs/adr</code>, <code>docs/decisions</code>, <code>adr</code>. Front‑matter status parsing included.
					</p>

					{/* Screenshot mock */}
					<div className="flex flex-col items-center w-full">
						<img
							src="/screenshot.png"
							alt="App screenshot"
							className="mx-auto rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl h-auto"
							style={{ maxHeight: 600 }}
						/>
					</div>
				</div>
			</div>
		);
	}

	// Main ADR UI for authenticated users
	// Get unique status values for filter dropdown
	const statusOptions = adrs
		? Array.from(
				new Set(
					adrs
						.map((a) => (/^superseded by \w+$/i.test(a.status || "") ? "superseded" : a.status))
						.filter(Boolean)
				)
			)
		: [];

	// Filter ADRs by status
	const filteredAdrs = adrs && statusFilter
		? adrs.filter((a) => {
				const normalized = /^superseded by \w+$/i.test(a.status || "") ? "superseded" : a.status;
				return normalized === statusFilter;
			})
		: adrs;

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<Sidebar onSelectRepo={setSelectedRepo} />

			{/* Main content: ADR list and detail */}
			<div className="flex flex-1 h-full">
				{/* ADR List */}
				<div className="w-1/3 max-w-xs min-w-[220px] p-6 overflow-y-auto" style={{ background: undefined, color: undefined }}>
					<h2 className="text-xl font-bold mb-4" style={{ color: "#111" }}>
						ADRs
					</h2>
					{/* Status filter dropdown */}
					{selectedRepo && statusOptions.length > 0 && (
						<div className="mb-4">
							<label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
								Filter by status:
							</label>
							<select
								id="statusFilter"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="w-full p-2 border rounded"
							>
								<option value="">All</option>
								{statusOptions.map((opt) => (
									<option key={opt} value={opt as string}>
										{opt}
									</option>
								))}
							</select>
						</div>
					)}
					{selectedRepo ? (
						<>
							{loading && !adrs && <p>Loading ADRs...</p>}
							{!loading && filteredAdrs && filteredAdrs.length === 0 && (
								<p className="text-gray-500">No ADRs found in this repository.</p>
							)}
							{!loading && filteredAdrs && filteredAdrs.length > 0 && (
								<ul className="space-y-2 pb-2 pr-1">
									{filteredAdrs.map((adr) => (
										<li
											key={adr.sha}
											onClick={() => setSelectedAdr(adr)}
											className={`cursor-pointer p-3 rounded-xl transition-colors duration-150 hover:bg-gray-100 shadow-sm ${
												selectedAdr?.sha === adr.sha ? "bg-gray-200 font-semibold ring-2 ring-gray-300" : ""
											}`}
										>
											<div className="flex justify-between items-center">
												<span>{adr.name.replace(/\.md$/i, "")}</span>
												{adr.status && (
													<span
														className={`ml-2 px-2 py-1 text-xs rounded font-semibold border
															${adr.status === "proposed" ? "bg-blue-100 text-blue-800 border-blue-300" : ""}
															${adr.status === "accepted" ? "bg-green-100 text-green-800 border-green-300" : ""}
															${adr.status === "rejected" ? "bg-red-100 text-red-800 border-red-300" : ""}
															${adr.status === "deprecated" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}
															${/^superseded by \w+$/i.test(adr.status) ? "bg-gray-300 text-gray-800 border-gray-400" : ""}
															${adr.status === "unknown" ? "bg-gray-100 text-gray-600 border-gray-300" : ""}
														`}
													>
														{/superseded by \w+/i.test(adr.status) ? "superseded" : adr.status}
													</span>
												)}
											</div>
										</li>
									))}
								</ul>
							)}
						</>
					) : (
						<p className="text-gray-500">Select a repository to view ADRs.</p>
					)}
				</div>
				{/* ADR Detail */}
				<div className="flex-1 p-6 overflow-y-auto">
					{loading && selectedAdr && <p>Loading ADR content...</p>}
					{!loading && adrContent && (
						<div className="max-w-4xl">
							{/* Front Matter Section */}
							{adrContent.frontMatter && Object.keys(adrContent.metadata).length > 0 && (
								<div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{adrContent.metadata.status && (
											<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
												<div className="flex flex-col">
													<span className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Status</span>
													<span
														className={`inline-block w-fit px-3 py-1 rounded-full text-sm font-semibold border ${
															adrContent.metadata.status === "accepted"
																? "bg-green-100 text-green-800 border-green-300"
																: adrContent.metadata.status === "proposed"
																? "bg-blue-100 text-blue-800 border-blue-300"
																: adrContent.metadata.status === "rejected"
																? "bg-red-100 text-red-800 border-red-300"
																: adrContent.metadata.status === "deprecated"
																? "bg-yellow-100 text-yellow-800 border-yellow-300"
																: adrContent.metadata.status.includes("superseded")
																? "bg-gray-100 text-gray-800 border-gray-300"
																: "bg-gray-100 text-gray-800 border-gray-300"
														}`}
													>
														{adrContent.metadata.status}
													</span>
												</div>
											</div>
										)}
										{adrContent.metadata.date && (
											<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
												<span className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">Date</span>
												<span className="text-lg font-semibold text-gray-900">{adrContent.metadata.date}</span>
											</div>
										)}
										{adrContent.metadata["decision-makers"] && (
											<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
												<span className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">Decision Makers</span>
												<span className="text-gray-900 font-medium">{adrContent.metadata["decision-makers"]}</span>
											</div>
										)}
										{adrContent.metadata.consulted && (
											<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
												<span className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">Consulted</span>
												<span className="text-gray-900 font-medium">{adrContent.metadata.consulted}</span>
											</div>
										)}
										{adrContent.metadata.informed && (
											<div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
												<span className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-2">Informed</span>
												<span className="text-gray-900 font-medium">{adrContent.metadata.informed}</span>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Markdown Content */}
							<div className="prose max-w-none">
								<ReactMarkdown>{adrContent.content}</ReactMarkdown>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
