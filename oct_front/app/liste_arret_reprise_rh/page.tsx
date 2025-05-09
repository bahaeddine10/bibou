"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface ArretReprise {
  id: number;
  employee_name: string;
  position: string;
  department: string;
  date_time: string;
  type_arret: number;
  reason: string;
  status_chef: boolean;
  status_rh: boolean;
  documents?: string[];
}

export default function ListeArretRepriseRH() {
  const [arrets, setArrets] = useState<ArretReprise[]>([]);
  const [selected, setSelected] = useState<ArretReprise | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formatDate = (str: string) => str?.split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
  acceptedArretsByChef {
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
      
      const json = await res.json();
      setArrets(json.data?.acceptedArretsByChef || []);
    };
    fetchData();
  }, []);

  const handleConfirm = async () => {
    if (!selected) return;
    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation { updateStatusRH(id: ${selected.id}, status_rh: 1) { id status_rh } }`,
      }),
    });
    setArrets(prev => prev.map(a => a.id === selected.id ? { ...a, status_rh: true } : a));
    setShowModal(false);
  };

  return (
    <Layout title="Liste des Arrêts/Reprises RH">
      <div className="p-6">
        <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Poste</th>
              <th className="px-4 py-2">Département</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Raison</th>
              <th className="px-4 py-2">Documents</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {arrets.map(a => (
              <tr key={a.id} className="text-black text-center">
                <td className="border px-2 py-1">{a.employee_name}</td>
                <td className="border px-2 py-1">{a.position}</td>
                <td className="border px-2 py-1">{a.department}</td>
                <td className="border px-2 py-1">{formatDate(a.date_time)}</td>
                <td className="border px-2 py-1">
  {a.type_arret === 0
    ? "Arrêt"
    : a.type_arret === 1
    ? "Reprise"
    : "Autorisation de Sortir"}
</td>
                <td className="border px-2 py-1">{a.reason}</td>
                <td className="border px-2 py-1 text-center">
  {a.documents && a.documents.length > 0 ? (
    <div className="flex flex-col items-center space-y-1">
      {a.documents.map((doc, idx) => (
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

                <td className="border px-2 py-1 space-x-2">
                  {a.status_rh ? (
                    <span className="text-green-600 font-semibold">Validé</span>
                  ) : (
                    <button
                      onClick={() => { setSelected(a); setShowModal(true); }}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Gérer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4 text-center">Valider l&rsquo;arrêt/reprise</h3>
            <p><strong>Nom:</strong> {selected.employee_name}</p>
              <p><strong>Poste:</strong> {selected.position}</p>
              <p><strong>Département:</strong> {selected.department}</p>
              <p><strong>Date:</strong> {formatDate(selected.date_time)}</p>
              <p><strong>Type:</strong> {selected.type_arret === 0 ? "Arrêt" : "Reprise"}</p>
              <p><strong>Raison:</strong> {selected.reason}</p>
              <div className="flex justify-end mt-6 space-x-3">
                <button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Valider</button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
