// components/Navbar.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import Logo from "./Logo";
import useSWR from "swr";

export default function Navbar() {
	const { data: session } = useSession();
	const owner = process.env.NEXT_PUBLIC_REPO_OWNER || "seluard";
	const repo = process.env.NEXT_PUBLIC_REPO_NAME || "open-adr";
	const fetcher = (url: string) => fetch(url).then((r) => r.json());
	const { data: repoInfo } = useSWR(`/api/github/repo?owner=${owner}&repo=${repo}`, fetcher, {
		revalidateOnFocus: false,
	});

	return (
	<nav className="flex items-center justify-between px-5 py-2 shadow-md" style={{ boxShadow: '0 4px 16px -4px rgba(0,0,0,0.15)' }}>
			<div className="flex items-center gap-3">
				<Logo size={40} />
				<h1 className="text-2xl font-extrabold tracking-tight">Open-ADR</h1>
			</div>
			<div className="flex items-center gap-3">
				{/* Repo name and stars */}
				<div className="hidden sm:flex items-center text-sm">
					<a
						href={repoInfo?.html_url || `https://github.com/${owner}/${repo}`}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`View ${repoInfo?.full_name || `${owner}/${repo}`} on GitHub`}
						title={`View ${repoInfo?.full_name || `${owner}/${repo}`} on GitHub`}
						className="inline-flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 font-semibold tracking-tight shadow-sm hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 transition-colors no-underline"
					>
						<span className="truncate max-w-[12rem]">{repoInfo?.full_name || `${owner}/${repo}`}</span>
						<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300 transition-colors">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
							<span>{typeof repoInfo?.stargazers_count === "number" ? repoInfo.stargazers_count : "—"}</span>
						</span>
					</a>
				</div>
				{session ? (
					<div className="flex items-center gap-4">
						{session.user?.image && (
							<Image
								src={session.user.image}
								alt="Avatar"
								width={36}
								height={36}
								className="rounded-full border-2 border-gray-300 shadow"
							/>
						)}
						<button
							onClick={() => signOut()}
							className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-150 shadow"
						>
							Sign out
						</button>
					</div>
				) : (
					<button
						onClick={() => signIn("github")}
						className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-150 shadow"
					>
						Sign in with GitHub
					</button>
				)}
			</div>
		</nav>
	);
}
