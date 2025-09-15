"use client";

import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";


const fetcher = (url: string) => fetch(url).then((res) => res.json());


export default function Sidebar({ onSelectRepo, defaultPublic = false, selectedRepo }: { onSelectRepo: (repo: Record<string, any>) => void, defaultPublic?: boolean, selectedRepo?: Record<string, any> | null }) {
	const { data: session } = useSession();
	const { data } = useSWR(session ? "/api/github/repos" : null, fetcher);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [orgFilter, setOrgFilter] = useState<string[]>([]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		}
		if (dropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownOpen]);
	const [nameFilter, setNameFilter] = useState<string>("");

	// Switch for public search
	const [publicSearch, setPublicSearch] = useState<boolean>(defaultPublic || !session);
	const [publicRepos, setPublicRepos] = useState<any[]>([]);
	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (publicSearch && nameFilter.length > 2) {
			timeout = setTimeout(() => {
				fetch(`/api/github/search?q=${encodeURIComponent(nameFilter)}&per_page=10`)
					.then(res => res.json())
					.then(res => {
						setPublicRepos(Array.isArray(res.items) ? res.items : []);
					});
			}, 500);
		} else {
			setPublicRepos([]);
		}
		return () => clearTimeout(timeout);
	}, [publicSearch, nameFilter]);

	// Sync external selection (after publicSearch is declared)
	useEffect(() => {
		if (selectedRepo?.id != null) {
			setSelectedId(Number((selectedRepo as any).id));
			if (!session && !publicSearch) setPublicSearch(true);
		}
	}, [selectedRepo, session, publicSearch]);

	// Group owners: treat user as an organization
	let orgOptions = Array.isArray(data)
		? Array.from(new Set(data.map((repo: any) => repo.owner?.login).filter(Boolean)))
		: [];
	const username = session?.user?.name || session?.user?.email || "";
	const hasOwnRepo = Array.isArray(data) && data.some((repo: any) => repo.owner?.login === username);
	if (username && !orgOptions.includes(username) && hasOwnRepo) {
		orgOptions = [username, ...orgOptions];
	}
	// Filter repositories by selected organization and name
	const filteredRepos = Array.isArray(data)
		? data.filter((repo: any) => {
			const matchesOrg = orgFilter.length > 0 ? orgFilter.includes(repo.owner?.login) : true;
			const matchesName = nameFilter ? repo.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
			return matchesOrg && matchesName;
		})
		: [];

	// Avoid duplicates: exclude selected repo from displayed lists
	const selectedOwner = selectedRepo?.owner?.login;
	const selectedName = selectedRepo?.name;
	const publicReposDisplay = publicRepos.filter((r) => !(selectedOwner && selectedName && r.owner?.login === selectedOwner && r.name === selectedName));
	const filteredReposDisplay = filteredRepos.filter((r: any) => !(selectedOwner && selectedName && r.owner?.login === selectedOwner && r.name === selectedName));

	return (
		<>
		<aside className="w-64 h-screen p-4 overflow-y-auto">
			<div className="mb-4">
				<div className="flex items-center gap-2 mb-2">
					<label className="flex items-center gap-2 text-sm font-medium">
						<span>Search public repositories</span>
						<button
							type="button"
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${publicSearch ? 'bg-blue-600' : 'bg-gray-300'}`}
							onClick={() => {
								// If user is not signed in and tries to switch to private (non-public), show modal
								if (!session && publicSearch) {
									setShowAuthModal(true);
									return;
								}
								setPublicSearch(!publicSearch);
								setNameFilter(""); // Clear search bar when toggling
							}}
						>
							<span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${publicSearch ? 'translate-x-5' : 'translate-x-1'}`}></span>
						</button>
					</label>
				</div>
				<label className="block text-sm font-medium mb-1">Repository name</label>
				<input
					type="text"
					className="w-full p-2 border rounded"
					placeholder="Search by name..."
					value={nameFilter}
					onChange={e => setNameFilter(e.target.value)}
				/>
			</div>
			{publicSearch ? (
				<ul className="space-y-3 pb-2 pr-1">
					{selectedRepo && (
						<li
							key={`pinned-${selectedRepo.id}`}
							onClick={() => { /* preserve selection */ onSelectRepo(selectedRepo); }}
							className={`cursor-pointer p-3 rounded-xl transition-all duration-200 bg-gray-50 border border-gray-200 shadow ${
								selectedId === (selectedRepo as any).id ? "ring-2 ring-gray-300" : ""
							}`}
						>
							<div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Selected</div>
							<div className="font-semibold text-base">{selectedRepo.name}</div>
							<div className="text-xs text-gray-500">{selectedRepo.owner?.login}/{selectedRepo.name}</div>
						</li>
					)}
					{publicReposDisplay.map((repo: any) => (
						<li
							key={repo.id}
							onClick={() => { setSelectedId(repo.id); onSelectRepo(repo); }}
							className={`cursor-pointer p-3 rounded-xl transition-all duration-200 hover:bg-gray-100 shadow ${
								selectedId === repo.id ? "bg-gray-200 font-bold ring-2 ring-gray-300" : ""
							}`}
						>
							<div className="font-semibold text-base">{repo.name}</div>
							<div className="text-xs text-gray-500">{repo.full_name}</div>
							<div className="text-xs text-gray-400">{repo.owner?.login}</div>
						</li>
					))}
					{publicReposDisplay.length === 0 && nameFilter.length > 2 && (
						<li className="p-3 text-gray-500">No public repositories found.</li>
					)}
				</ul>
			) : (
				<>
					<div className="mb-4 relative" ref={dropdownRef}>
						<label className="block text-sm font-medium mb-1">Organization</label>
						<button
							type="button"
							className="w-full p-2 border rounded flex justify-between items-center bg-white"
							onClick={() => setDropdownOpen(!dropdownOpen)}
						>
							{orgFilter.length === 0 ? "Select organization..." : `${orgFilter.length} selected`}
							<span className="ml-2">▼</span>
						</button>
						{dropdownOpen && (
							<div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-64 overflow-y-auto">
								{orgOptions.map(org => (
									<label key={org} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
										<input
											type="checkbox"
											checked={orgFilter.includes(org)}
											onChange={e => {
												if (e.target.checked) {
													setOrgFilter([...orgFilter, org]);
												} else {
													setOrgFilter(orgFilter.filter(o => o !== org));
												}
											}}
										/>
										<span>{org}</span>
									</label>
								))}
								<button
									className="w-full text-xs text-blue-600 underline px-3 py-2 text-left"
									type="button"
									onClick={() => setOrgFilter([])}
								>
									Clear selection
								</button>
							</div>
						)}
					</div>
					<ul className="space-y-3 pb-2 pr-1">
						{selectedRepo && (
							<li
								key={`pinned-auth-${selectedRepo.id}`}
								onClick={() => { onSelectRepo(selectedRepo); }}
								className={`cursor-pointer p-3 rounded-xl transition-all duration-200 bg-gray-50 border border-gray-200 shadow ${
									selectedId === (selectedRepo as any).id ? "ring-2 ring-gray-300" : ""
								}`}
							>
								<div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Selected</div>
								<div className="font-semibold text-base">{selectedRepo.name}</div>
								<div className="text-xs text-gray-500">{selectedRepo.owner?.login}/{selectedRepo.name}</div>
							</li>
						)}
						{filteredReposDisplay.map((repo: any) => (
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
						{filteredReposDisplay.length === 0 && (
							<li className="p-3 text-gray-500">No repositories found.</li>
						)}
					</ul>
				</>
			)}
		</aside>

		{/* Auth required modal */}
		{showAuthModal && (
			<div className="fixed inset-0 z-50 flex items-center justify-center">
				<div
					className="absolute inset-0 bg-black/40"
					onClick={() => setShowAuthModal(false)}
				/>
				<div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
					<div className="mb-4 flex items-start justify-between">
						<h3 className="text-lg font-semibold text-gray-900">Sign in required</h3>
						<button
							aria-label="Close"
							className="rounded p-1 text-gray-500 hover:bg-gray-100"
							onClick={() => setShowAuthModal(false)}
						>
							✕
						</button>
					</div>
					<p className="text-sm text-gray-600">
						To browse your own repositories, please sign in with GitHub. Public repository search will remain available without signing in.
					</p>
					<div className="mt-6 flex items-center justify-end gap-3">
						<button
							className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
							onClick={() => setShowAuthModal(false)}
						>
							Not now
						</button>
						<button
							className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md active:translate-y-px"
							onClick={() => signIn("github")}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
								<path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 0 0 8.21 11.43c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.74.08-.72.08-.72 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.8 1.31 3.48 1 .11-.78.42-1.31.76-1.62-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.15 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.85.12 3.15.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.61-5.49 5.91.43.37.81 1.1.81 2.22 0 1.6-.02 2.88-.02 3.27 0 .32.22.7.83.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
							</svg>
							Sign in with GitHub
						</button>
					</div>
				</div>
			</div>
		)}
		</>
	);
};
