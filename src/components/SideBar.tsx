"use client";

import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";


const fetcher = (url: string) => fetch(url).then((res) => res.json());

function uniqueOwners(repos: any[] | undefined) {
	if (!Array.isArray(repos)) return [];
	const owners = new Set<string>();
	repos.forEach(repo => {
		if (repo.owner?.login) {
			owners.add(repo.owner.login);
		}
	});
	return Array.from(owners);
}


export default function Sidebar({ onSelectRepo }: { onSelectRepo: (repo: Record<string, any>) => void }) {
	const { data, error } = useSWR("/api/github/repos", fetcher);
	const { data: session } = useSession();
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [orgFilter, setOrgFilter] = useState<string[]>([]);
	const [dropdownOpen, setDropdownOpen] = useState(false);
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
	const [publicSearch, setPublicSearch] = useState(false);
	const [publicRepos, setPublicRepos] = useState<any[]>([]);
	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (publicSearch && nameFilter.length > 2) {
			timeout = setTimeout(() => {
				fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(nameFilter)}&per_page=10`)
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

	return (
		<aside className="w-64 h-screen p-4 overflow-y-auto">
			<div className="mb-4">
				<div className="flex items-center gap-2 mb-2">
					<label className="flex items-center gap-2 text-sm font-medium">
						<span>Search public repositories</span>
						<button
							type="button"
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${publicSearch ? 'bg-blue-600' : 'bg-gray-300'}`}
							onClick={() => {
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
					{publicRepos.map((repo: any) => (
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
					{publicRepos.length === 0 && nameFilter.length > 2 && (
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
						{filteredRepos.map((repo: any) => (
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
						{filteredRepos.length === 0 && (
							<li className="p-3 text-gray-500">No repositories found.</li>
						)}
					</ul>
				</>
			)}
		</aside>
	);
};
