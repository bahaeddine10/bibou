"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface Mission {
  id: number;
  nom: string;
  fonction: string;
  department: string;
  datedebut: string;
  datefin: string;
  sujet: string;
  statusrh: string;
  accompagnant?: string;

}

export default function ListeMissionsRH() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
            missions {
              id
              nom
              fonction
              department
              datedebut
              datefin
              accompagnant
              sujet
              statusrh
            }
          }`,
        }),
      });
      const json = await res.json();
      setMissions(json.data?.missions || []);
    };
    fetchData();
  }, []);

  const formatDate = (str: string) => str?.split("T")[0];

  const handleUpdateStatus = async (statusrh: string) => {
    if (!selected) return;
    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation {
          updateStatusRHMission(id: ${selected.id}, statusrh: "${statusrh}") {
            id
            statusrh
          }
        }`,
      }),
    });
    setMissions(prev => prev.map(m => m.id === selected.id ? { ...m, statusrh } : m));
    setShowModal(false);
  };

  return (
    <Layout title="Liste des Missions RH">
      <div className="p-6">
        <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Fonction</th>
              <th className="px-4 py-2">Département</th>
              <th className="px-4 py-2">Accompagnants</th>
              <th className="px-4 py-2">Du</th>
              <th className="px-4 py-2">À</th>
              <th className="px-4 py-2">Sujet</th>
              <th className="px-4 py-2">Statut RH</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id} className="text-black text-center">
                <td className="border px-2 py-1">{m.nom}</td>
                <td className="border px-2 py-1">{m.fonction}</td>
                <td className="border px-2 py-1">{m.department}</td>
                <td className="border px-2 py-1">{m.accompagnant}</td>
                <td className="border px-2 py-1">{formatDate(m.datedebut)}</td>
                <td className="border px-2 py-1">{formatDate(m.datefin)}</td>
                <td className="border px-2 py-1">{m.sujet}</td>
                <td className="border px-2 py-1">
                  {m.statusrh === "1"
                    ? "✅ Acceptée"
                    : m.statusrh === "2"
                    ? "❌ Refusée"
                    : "⏳ En attente"}
                </td>
                <td className="border px-2 py-1">
                  {m.statusrh === "0" || !m.statusrh ? (
                    <button
                      onClick={() => { setSelected(m); setShowModal(true); }}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Gérer
                    </button>
                  ) : (
                    <span className="text-gray-500 italic">Traité</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Valider la mission</h3>
              <p><strong>Nom:</strong> {selected.nom}</p>
              <p><strong>Fonction:</strong> {selected.fonction}</p>
              <p><strong>Du:</strong> {formatDate(selected.datedebut)}</p>
              <p><strong>À:</strong> {formatDate(selected.datefin)}</p>
              <p><strong>Sujet:</strong> {selected.sujet}</p>
              <div className="flex justify-end mt-6 space-x-3">
                <button onClick={() => handleUpdateStatus("1")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Accepter</button>
                <button onClick={() => handleUpdateStatus("2")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Refuser</button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
