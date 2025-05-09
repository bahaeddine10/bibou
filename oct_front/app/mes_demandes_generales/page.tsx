"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface DemandeGenerale {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  type: number;
  type_label: string;
  status: string;
  date_soumission: string;
  date_traitement?: string;
  document?: string;
  department: string;
  fonction: string;
}

export default function MesDemandesGeneralesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<DemandeGenerale[]>([]);
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
              demandesGeneralesByMatricule(matricule: "${session.user.matricule}") {
                id
                nom
                prenom
                matricule
                type
                type_label
                status
                date_soumission
                date_traitement
                document
                department
                fonction
              }
            }`,
          }),
        });
        const json = await res.json();
        setDemandes(json.data.demandesGeneralesByMatricule || []);
      } catch (error) {
        console.error("Error fetching demandes:", error);
      }
    };

    fetchData();
  }, [session]);

  const formatDate = (str: string) => str?.split("T")[0];

  const filtered = demandes
    .filter((d) => d.date_soumission.includes(searchTerm))
    .sort((a, b) => {
      const dateA = new Date(a.date_soumission).getTime();
      const dateB = new Date(b.date_soumission).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <Layout title="Mes Demandes Générales">
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
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2">Date de soumission</th>
                <th className="px-4 py-2">Date de traitement</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Document</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="text-black text-center">
                  <td className="border px-2 py-1">{formatDate(d.date_soumission)}</td>
                  <td className="border px-2 py-1">
                    {d.date_traitement ? formatDate(d.date_traitement) : "Non traité"}
                  </td>
                  <td className="border px-2 py-1">{d.type_label}</td>
                  <td className="border px-2 py-1">
                    {d.status === "0" ? "⏳" : d.status === "1" ? "✅" : "❌"}
                  </td>
                  <td className="border px-2 py-1">
                    {d.document ? (
                      <div className="space-x-2">
                        <a
                          href={`http://localhost:8000/storage/demande_generale/${d.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Afficher
                        </a>
                        <a
                          href={`http://localhost:8000/storage/demande_generale/${d.document}`}
                          download
                          className="text-green-600 hover:underline"
                        >
                          Télécharger
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucun document</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => router.push("/demande_generale")}
          className="bg-[#004571] hover:bg-[#005f8f] text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Ajouter une Demande Générale
        </button>
      </div>
    </Layout>
  );
}
