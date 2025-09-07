"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/SideBar";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [adrs, setAdrs] = useState<any[] | null>(null);
  const [selectedAdr, setSelectedAdr] = useState<any | null>(null);
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
      <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
        <h1 className="text-4xl font-extrabold mb-4">Open-ADR</h1>
        <p className="text-lg max-w-xl text-center">
          Welcome to Open-ADR, a platform for managing and visualizing Architecture Decision Records (ADRs) in your software projects.
        </p>
      </div>
    );
  }

  // Main ADR UI for authenticated users
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
          {selectedRepo ? (
            <>
              {loading && !adrs && <p>Loading ADRs...</p>}
              {!loading && adrs && adrs.length === 0 && (
                <p className="text-gray-500">No ADRs found in this repository.</p>
              )}
              {!loading && adrs && adrs.length > 0 && (
                <ul className="space-y-2 pb-2 pr-1">
                  {adrs.map((adr) => (
                    <li
                      key={adr.sha}
                      onClick={() => setSelectedAdr(adr)}
                      className={`cursor-pointer p-3 rounded-xl transition-colors duration-150 hover:bg-gray-100 shadow-sm ${
                        selectedAdr?.sha === adr.sha ? "bg-gray-200 font-semibold ring-2 ring-gray-300" : ""
                      }`}
                    >
                      {adr.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-gray-600">Select a repository to view its ADRs</p>
          )}
        </div>

        {/* Vista detalle ADR */}
    <main
      className="flex-1 p-6 overflow-y-auto"
      style={{ background: undefined, color: undefined }}
    >
          {selectedAdr ? (
            loading && !adrContent ? (
              <p>Loading content...</p>
            ) : adrContent ? (
              <div className="prose max-w-full text-black dark:text-white">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p className="my-2" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="my-1" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-blue-50 px-1 rounded" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 underline" {...props} />,
                  }}
                >
                  {adrContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p>Could not load ADR.</p>
            )
          ) : (
            <p className="text-gray-500">Select an ADR to view its content</p>
          )}
        </main>
      </div>
    </div>
  );
}
