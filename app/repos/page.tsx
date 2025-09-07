"use client";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ReposPage() {
  const { data, error } = useSWR("/api/github/repos", fetcher);

  if (error) return <div>Error cargando repos</div>;
  if (!data) return <div>Cargando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Repositorios</h1>
      <ul className="mt-4">
        {data.map((repo: any) => (
          <li key={repo.full_name} className="py-2">
            <a className="text-blue-600" href={`/adr/${repo.owner.login}/${repo.name}`}>{repo.full_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
