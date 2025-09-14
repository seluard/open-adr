"use client";

import { useState } from "react";
import AdrBrowser from "@/components/AdrBrowser";
import { signIn, useSession } from "next-auth/react";
import Logo from "@/components/Logo";
import Link from "next/link";

export default function HomePage() {
	const { data: session } = useSession();
	const demoRepos = (process.env.NEXT_PUBLIC_DEMO_REPOS || "seluard/open-adr").split(",").map((s) => s.trim()).filter(Boolean);
	// local state no longer needed; the browser component encapsulates UI

	// All browsing logic is delegated to the AdrBrowser component

	// Unauthenticated landing hero
	if (!session) {
		return (
			<div className="relative flex items-center justify-center min-h-[calc(100vh-2rem)] overflow-x-hidden overflow-y-auto rounded-3xl bg-white/70 dark:bg-white/60">
				{/* Decorative gradient blobs */}
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="absolute -top-24 -left-16 h-72 w-72 bg-gradient-to-tr from-indigo-300 via-blue-300 to-cyan-200 rounded-full blur-3xl opacity-60" />
					<div className="absolute -bottom-24 -right-16 h-72 w-72 bg-gradient-to-tr from-rose-300 via-fuchsia-300 to-purple-300 rounded-full blur-3xl opacity-60" />
				</div>

				<div className="relative z-10 flex flex-col items-center px-6 text-center">
					<h1 className="max-w-5xl text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
						<span className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700 bg-clip-text text-transparent">Make Decisions</span>
						<br className="hidden md:block" />
						<span className="text-gradient-shimmer">Discoverable.</span>
					</h1>

					<p className="max-w-2xl text-lg md:text-xl text-gray-600 mb-8">
						Capture, discover, and evolve(soon) ADRs, right where your code lives.
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
						<Link
							href="/explore"
							className="group inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-[2px] shadow-lg transition hover:shadow-xl active:translate-y-px"
						>
							<span className="inline-flex items-center gap-2 rounded-[10px] bg-white/80 px-5 py-3 text-gray-900 backdrop-blur-sm">
								<img src="/globe.svg" alt="" className="h-5 w-5 opacity-80 transition group-hover:opacity-100" />
								<span className="font-medium">Explore public repositories</span>
							</span>
						</Link>
						{/* Moved repository link to the Navbar as an icon; button removed here */}
					</div>

					{demoRepos.length > 0 && (
						<div className="mt-6 flex flex-col items-center gap-2">
							<span className="text-sm text-gray-500">Or jump in with Open-ADR itself (meta!)</span>
							<div className="flex flex-wrap justify-center gap-2">
								{demoRepos.map((full) => {
									const [owner, repo] = full.split("/");
									if (!owner || !repo) return null;
									return (
										<Link
											key={full}
											href={`/explore?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`}
											className="group inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 p-[2px] shadow-lg transition hover:shadow-xl active:translate-y-px"
										>
											<span className="inline-flex items-center gap-2 rounded-[10px] bg-white/85 px-4 py-2 text-sm text-gray-900 backdrop-blur-sm group-hover:bg-white">
												<img src="/file.svg" alt="" className="h-4 w-4 opacity-90 transition group-hover:opacity-100" />
												<span className="font-medium">{owner}/{repo}</span>
											</span>
										</Link>
									);
								})}
							</div>
						</div>
					)}

					<p className="mt-6 max-w-xl text-sm text-gray-500">
					</p>

					{/* Screenshot mock */}
					<div className="flex flex-col items-center w-full">
						<img
							src="/screenshot.png"
							alt="App screenshot"
							className="mx-auto rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl h-auto"
							style={{ maxHeight: 720 }}
						/>
					</div>
				</div>
			</div>
		);
	}

	return <AdrBrowser defaultPublic={false} />;
}
