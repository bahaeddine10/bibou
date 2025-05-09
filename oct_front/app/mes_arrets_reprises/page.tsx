"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface ArretReprise {
  id: number;
  employee_name: string;
  position: string;
  department: string;
  reason: string;
  date_time: string;
  type_arret: number;
  document_url: string;
  status_chef: number;
  status_rh: number;
}

export default function ListeArretReprisePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [arrets, setArrets] = useState<ArretReprise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.matricule) return;

      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              arretsByMatricule(matricule: "${session.user.matricule}") {
                id
                employee_name
                position
                department
                reason
                date_time
                type_arret
                document_url
                status_chef
                status_rh
              }
            }`,
          }),
        });

        const json = await res.json();
        setArrets(json.data.arretsByMatricule || []);
      } catch (error) {
        console.error("Error fetching arrets:", error);
      }
    };

    fetchData();
  }, [session]);

  const formatDateFr = (dateStr: string) => {
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const filtered = arrets
    .filter((a) => a.date_time.includes(searchTerm))
    .sort((a, b) => {
      const dateA = new Date(a.date_time).getTime();
      const dateB = new Date(b.date_time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <Layout title="Mes Arrêts / Reprises">
      <div className="p-6 pt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search by date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded bg-white text-black shadow-sm"
            />
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border rounded bg-white hover:bg-blue-100 text-black shadow-sm"
            >
              Trier {sortOrder === "asc" ? "↓" : "↑"}
            </button>
          </div>

          <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Raison</th>
                <th className="px-4 py-2 border">Status Chef</th>
                <th className="px-4 py-2 border">Status DMB</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="text-center border text-black bg-white hover:bg-gray-50">
                  <td className="px-4 py-2 border">{formatDateFr(a.date_time)}</td>
                  <td className="px-4 py-2 border">
  {a.type_arret === 0
    ? "Arrêt"
    : a.type_arret === 1
    ? "Reprise"
    : "Autorisation de Sortir"}
</td>
                  <td className="px-4 py-2 border">{a.reason}</td>
                  <td className="px-4 py-2 border">{a.status_chef === 1 ? "✅" : "⏳"}</td>
                  <td className="px-4 py-2 border">{a.status_rh === 1 ? "✅" : "⏳"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => router.push("/demande_arret_reprise")}
          className="bg-[#004571] hover:bg-[#005f8f] text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Demander un Arrêt / Reprise
        </button>
      </div>
    </Layout>
  );
}
