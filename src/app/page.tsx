"use client";
import AdrBrowser from "@/components/AdrBrowser";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
	const { data: session } = useSession();

	// All browsing logic is delegated to the AdrBrowser component

	// Unauthenticated landing hero
	if (!session) {
		return (
			<>
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

					{/* Primary CTA: Explore public repositories */}
					<div className="mb-4 flex items-center justify-center">
						<Link
							aria-label="Explore public repositories"
							href="/explore?owner=seluard&repo=open-adr"
							className="group relative inline-flex items-center rounded-2xl p-[2px]"
						>
							<span className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 blur-lg opacity-60 transition-opacity group-hover:opacity-80" />
							<span className="relative inline-flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-3 text-base md:text-lg font-semibold text-gray-900 shadow-lg ring-1 ring-black/5 transition-transform group-active:translate-y-px">
								<Image src="/globe.svg" alt="" width={20} height={20} className="h-5 w-5 opacity-90 transition group-hover:opacity-100" />
								<span>Try it now — Explore public repos</span>
								<span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">no sign-in required</span>
							</span>
						</Link>
					</div>


					<p className="mt-6 max-w-xl text-sm text-gray-500">
					</p>

					{/* Screenshot mock */}
					<div className="flex flex-col items-center w-full">
						<Image
							src="/screenshot.png"
							alt="App screenshot"
							width={1280}
							height={720}
							className="mx-auto rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl h-auto"
							style={{ maxHeight: 720 }}
							priority
						/>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full mt-8">
				<div className="mx-auto max-w-6xl px-6 py-8 border-t border-gray-200/70 dark:border-white/10 text-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center gap-2 text-black">
						<Image src="/logo.png" alt="Open ADR logo" width={24} height={24} className="h-6 w-6 rounded" />
						<span className="font-medium">Open ADR</span>
						<span className="text-black">·</span>
						<span>© {new Date().getFullYear()}</span>
					</div>
					<nav className="flex items-center gap-5">
						<a
							href="https://github.com/seluard/open-adr"
							target="_blank"
							rel="noopener noreferrer"
							className="text-black hover:text-black transition-colors"
						>
							GitHub
						</a>
					</nav>
				</div>
			</footer>
			</>
		);
	}

	return <AdrBrowser defaultPublic={false} />;
}
