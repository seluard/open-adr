"use client";

import useSWR from "swr";
import { useState, useRef, useEffect } from "react";


const fetcher = (url: string) => fetch(url).then((res) => res.json());

function uniqueOwners(repos: any[]) {
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

	if (error) return <div className="p-4 text-red-500">Error loading repositories: {String(error)}</div>;
	if (!data) return <div className="p-4">Loading repositories...</div>;


		// Quick debug: if the API returned an error object, show it
		if (!Array.isArray(data)) {
			console.error("API /api/github/repos returned:", data);
			const msg = data?.error || data?.message || "Unexpected server response";
			return <div className="p-4 text-yellow-700">Could not fetch repositories: {msg}</div>;
		}

		// Obtener owners únicos (organizaciones y usuario)
		const ownerOptions = uniqueOwners(data);

		// Filtrar repositorios por owners (multi-check) y nombre
		const filteredRepos = data.filter((repo: any) => {
			const matchesOrg = orgFilter.length > 0 ? orgFilter.includes(repo.owner?.login) : true;
			const matchesName = nameFilter ? repo.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
			return matchesOrg && matchesName;
		});

	return (
		<aside className="w-64 h-screen p-4 overflow-y-auto">
			<div className="mb-4 relative" ref={dropdownRef}>
				<label className="block text-sm font-medium mb-1">Owner (User/Organization)</label>
				<button
					type="button"
					className="w-full p-2 border rounded flex justify-between items-center bg-white"
					onClick={() => setDropdownOpen(!dropdownOpen)}
				>
					{orgFilter.length === 0 ? "Select owners..." : `${orgFilter.length} selected`}
					<span className="ml-2">▼</span>
				</button>
				{dropdownOpen && (
					<div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto">
						{ownerOptions.map((owner: string) => (
							<label key={owner} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
								<input
									type="checkbox"
									checked={orgFilter.includes(owner)}
									onChange={e => {
										if (e.target.checked) {
											setOrgFilter([...orgFilter, owner]);
										} else {
											setOrgFilter(orgFilter.filter(o => o !== owner));
										}
									}}
								/>
								<span>{owner}</span>
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
			<div className="mb-4">
				<label className="block text-sm font-medium mb-1">Name</label>
				<input
					type="text"
					className="w-full p-2 border rounded"
					placeholder="Search by name..."
					value={nameFilter}
					onChange={e => setNameFilter(e.target.value)}
				/>
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
		</aside>
	);
}
