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
  statusdmb: string;
  voiture?: string;
  chauffeur?: string;
  accompagnant?: string;

}

interface Voiture {
  matricule: string;
  marque: string;
  modele: string;
}

interface Chauffeur {
  IDT_MATAG: string;
  IDT_NOMAG: string;
  IDT_PRNAG: string;
}

export default function ListeMissionsDMB() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [chauffeur, setChauffeur] = useState("");
  const [voiture, setVoiture] = useState("");

  const formatDate = (str: string) => str?.split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `query { missions { id nom fonction department datedebut datefin accompagnant sujet statusdmb voiture chauffeur } }` }),
      });
      const json = await res.json();
      setMissions(json.data?.missions || []);
    };

    const fetchChauffeurs = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `query { chauffeursEnActivite { IDT_MATAG IDT_NOMAG IDT_PRNAG } }` }),
      });
      const json = await res.json();
      setChauffeurs(json.data?.chauffeursEnActivite || []);
    };

    const fetchVoitures = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `query { voituresDisponibles { matricule marque modele } }` }),
      });
      const json = await res.json();
      setVoitures(json.data?.voituresDisponibles || []);
    };

    fetchData();
    fetchChauffeurs();
    fetchVoitures();
  }, []);

  const handleConfirm = async (status: string) => {
    if (!selected) return;
    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation {
          updateStatusDMBMission(
            id: ${selected.id},
            statusdmb: "${status}",
            voiture: "${voiture}",
            chauffeur: "${chauffeur}"
          ) {
            id
            statusdmb
          }
        }`,
      }),
    });
    setMissions((prev) =>
      prev.map((m) => (m.id === selected.id ? { ...m, statusdmb: status } : m))
    );
    setShowModal(false);
  };

  return (
    <Layout title="Liste des Missions (DMB)">
      <div className="p-6">
        <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Poste</th>
              <th className="px-4 py-2">Département</th>
              <th className="px-4 py-2">Accompagnants</th>
              <th className="px-4 py-2">Début</th>
              <th className="px-4 py-2">Fin</th>
              <th className="px-4 py-2">Sujet</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((m) => (
              <tr key={m.id} className="text-center text-black">
                <td className="border px-2 py-1">{m.nom}</td>
                <td className="border px-2 py-1">{m.fonction}</td>
                <td className="border px-2 py-1">{m.department}</td>
                <td className="border px-2 py-1">{m.accompagnant}</td>
                <td className="border px-2 py-1">{formatDate(m.datedebut)}</td>
                <td className="border px-2 py-1">{formatDate(m.datefin)}</td>
                <td className="border px-2 py-1">{m.sujet}</td>
                <td className="border px-2 py-1">
                  {m.statusdmb === "1" ? "✅" : m.statusdmb === "2" ? "❌" : "⏳"}
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => {
                      setSelected(m);
                      setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Gérer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4 text-center">Gérer la Mission</h3>
              <p><strong>Nom:</strong> {selected.nom}</p>
              <p><strong>Poste:</strong> {selected.fonction}</p>
              <p><strong>Département:</strong> {selected.department}</p>
              <p><strong>Sujet:</strong> {selected.sujet}</p>
              <div className="my-4">
                <label className="block mb-1">Chauffeur</label>
                <select className="w-full border p-2 rounded" value={chauffeur} onChange={(e) => setChauffeur(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {chauffeurs.map((c) => (
                    <option key={c.IDT_MATAG} value={c.IDT_NOMAG + " " + c.IDT_PRNAG}>{c.IDT_NOMAG} {c.IDT_PRNAG}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Voiture</label>
                <select className="w-full border p-2 rounded" value={voiture} onChange={(e) => setVoiture(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {voitures.map((v) => (
                    <option key={v.matricule} value={v.matricule}>{v.marque} {v.modele}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => handleConfirm("1")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Accepter</button>
                <button onClick={() => handleConfirm("2")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Refuser</button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
