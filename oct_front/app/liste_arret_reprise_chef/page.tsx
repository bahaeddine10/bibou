"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface ArretReprise {
  id: number;
  employee_name: string;
  position: string;
  reason: string;
  date_time: string;
  type_arret: number;
  documents?: string[];
  status_rh: boolean;
}

export default function ListeArretRepriseRHPage() {
  const { data: session } = useSession();
  const [arrets, setArrets] = useState<ArretReprise[]>([]);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
            arretsByDepartment(departmentId: "${session?.user?.departmentId}") {
              id
              employee_name
              position
              department
              date_time
              type_arret
              reason
              status_chef
              status_rh
              documents
            }
          }`,
          
        }),
      });
      const result = await response.json();
      setArrets(result.data?.arretsByDepartment || []);
    } catch (err) {
      console.error("Erreur fetch RH:", err);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation {
            updateStatusChef(id: ${id}, status_chef: 1) {
              id status_chef
            }
          }`,
        }),
      });
      setArrets(prev =>
        prev.map(arret =>
          arret.id === id ? { ...arret, status_rh: true } : arret
        )
      );
    } catch (error) {
      console.error("Erreur mutation:", error);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  return (
    <Layout title="Liste Arrêts / Reprises - RH">
      <div className="p-6">
      <h2 className="text-xl font-bold mb-6">Demandes d&rsquo;Arrêts / Reprises</h2>
      <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Poste</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Raison</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Certificat</th>
              <th className="px-4 py-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {arrets.map((item) => (
              <tr key={item.id} className="text-black">
                <td className="px-4 py-2 border">{item.employee_name}</td>
                <td className="px-4 py-2 border">{item.position}</td>
                <td className="px-4 py-2 border">
  {item.type_arret === 0
    ? "Arrêt"
    : item.type_arret === 1
    ? "Reprise"
    : "Autorisation de Sortir"}
</td>
                <td className="px-4 py-2 border">{item.reason}</td>
                <td className="px-4 py-2 border">{formatDateFr(item.date_time)}</td>
                <td className="px-4 py-2 border text-center">
  {item.documents && item.documents.length > 0 ? (
    <div className="flex flex-col items-center space-y-1">
      {item.documents.map((doc, idx) => (
        <div key={idx} className="flex gap-2">
          <button
            className="text-blue-600 underline hover:text-blue-800"
            onClick={() =>
              window.open(`http://localhost:8000/storage/arret_reprise/${doc}`, "_blank")
            }
          >
            Afficher {idx + 1}
          </button>
          <a
            href={`http://localhost:8000/storage/arret_reprise/${doc}`}
            download
            className="text-green-600 underline hover:text-green-800"
          >
            Télécharger
          </a>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-gray-500 italic">Aucun</span>
  )}
</td>

                <td className="px-4 py-2 border text-center">
                  {item.status_rh ? (
                    <span className="text-green-600 font-semibold">Accepté</span>
                  ) : (
                    <button
                      onClick={() => handleAccept(item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    >
                      Accepter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}