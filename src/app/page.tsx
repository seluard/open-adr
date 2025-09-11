"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

export default function HomePage() {
	const { data: session } = useSession();
		const [selectedRepo, setSelectedRepo] = useState<Record<string, any> | null>(null);
		const [adrs, setAdrs] = useState<Array<{ sha: string; name: string; path: string; status?: string }> | null>(null);
		const [statusFilter, setStatusFilter] = useState<string>("");
		const [selectedAdr, setSelectedAdr] = useState<{ sha: string; name: string; path: string } | null>(null);
	const [adrContent, setAdrContent] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Fetch ADRs cuando se selecciona repo
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

	// Fetch contenido ADR cuando se selecciona
	useEffect(() => {
		if (selectedRepo && selectedAdr) {
			setAdrContent(null);
			setLoading(true);

			fetch(
				`/api/github/adr/content?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}&path=${encodeURIComponent(selectedAdr.path)}`
			)
				.then((res) => res.json())
				.then((data) => {
					setAdrContent(data.content || "No se pudo cargar el ADR");
					setLoading(false);
				})
				.catch(() => {
					setAdrContent("Error cargando ADR");
					setLoading(false);
				});
		}
	}, [selectedAdr, selectedRepo]);

	if (!session) {
		return (
			<div className="flex flex-col items-center justify-center h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', boxShadow: 'none' }}>
				<h1 className="text-4xl font-extrabold mb-4">Open-ADR</h1>
				<p className="text-lg max-w-xl text-center">
					Welcome to Open-ADR, a platform for managing and visualizing Architecture Decision Records (ADRs) in your software projects.
				</p>
			</div>
		);
	}

	// Main ADR UI for authenticated users
	// Get unique status values for filter dropdown
	const statusOptions = adrs ? Array.from(new Set(adrs.map(a =>
		/^superseded by \w+$/i.test(a.status || "") ? "superseded" : a.status
	).filter(Boolean))) : [];

	// Filter ADRs by status
	const filteredAdrs = adrs && statusFilter
		? adrs.filter(a => {
			const normalized = /^superseded by \w+$/i.test(a.status || "") ? "superseded" : a.status;
			return normalized === statusFilter;
		})
		: adrs;

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<Sidebar onSelectRepo={setSelectedRepo} />

			{/* Main content: lista de ADRs y detalle */}
			<div className="flex flex-1 h-full">
				{/* Lista de ADRs */}
				<div
					className="w-1/3 max-w-xs min-w-[220px] p-6 overflow-y-auto"
					style={{ background: undefined, color: undefined }}
				>
					<h2 className="text-xl font-bold mb-4" style={{ color: '#111' }}>ADRs</h2>
					{/* Status filter dropdown */}
					{selectedRepo && statusOptions.length > 0 && (
						<div className="mb-4">
							<label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by status:</label>
							<select
								id="statusFilter"
								value={statusFilter}
								onChange={e => setStatusFilter(e.target.value)}
								className="w-full p-2 border rounded"
							>
								<option value="">All</option>
								{statusOptions.map(opt => (
									<option key={opt} value={opt}>{opt}</option>
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
												<span>{adr.name}</span>
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
				{/* Detalle ADR */}
				<div className="flex-1 p-6 overflow-y-auto">
					{loading && selectedAdr && <p>Loading ADR content...</p>}
					{!loading && adrContent && (
						<div className="prose max-w-3xl">
							<ReactMarkdown>{adrContent}</ReactMarkdown>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
