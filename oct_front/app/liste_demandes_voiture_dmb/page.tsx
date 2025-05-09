"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface DemandeVoiture {
  id: number;
  nom: string;
  matricule: string;
  date_debut: string;
  date_fin: string;
  accompagnant: string;
  status_chef: number;
  status_dmb: number;
  chauffeur: string;
  voiture_matricule: string;
  departmentId: string;
  created_at: string;
  updated_at: string;
}

interface Chauffeur {
  IDT_MATAG: string;
  IDT_NOMAG: string;
  IDT_PRNAG: string;
}

export default function ListeDemandesVoitureDmbPage() {
  const [demandes, setDemandes] = useState<DemandeVoiture[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [selectedDemande, setSelectedDemande] = useState<DemandeVoiture | null>(null);
  const [chauffeur, setChauffeur] = useState("");
  const [voitureMatricule, setVoitureMatricule] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [voitures, setVoitures] = useState<{ id: number, matricule: string, marque: string, modele: string }[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            voituresDisponibles {
              id
              matricule
              marque
              modele
              disponibilite
            }
          }
        `,
      }),
    })
      .then(res => res.json())
      .then(data => setVoitures(data.data.voituresDisponibles));
    

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query { allDemandesVoiture { id nom matricule date_debut date_fin accompagnant status_chef status_dmb chauffeur voiture_matricule departmentId created_at updated_at }}` }),
    })
      .then(res => res.json())
      .then(data => setDemandes(data.data.allDemandesVoiture));

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query { chauffeursEnActivite { IDT_MATAG IDT_NOMAG IDT_PRNAG }}` }),
    })
      .then(res => res.json())
      .then(data => setChauffeurs(data.data.chauffeursEnActivite));
  }, []);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const handleConfirm = async () => {
    if (!selectedDemande) return;
    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            updateStatusDmbVoiture(
              id: ${selectedDemande.id},
              status_dmb: 1,
              chauffeur: "${chauffeur}",
              voiture_matricule: "${voitureMatricule}"
            ) {
              id status_dmb chauffeur voiture_matricule
            }
          }
        `,
      }),
    });
    setDemandes(prev => prev.map(d => d.id === selectedDemande.id ? { ...d, status_dmb: 1, chauffeur, voiture_matricule: voitureMatricule } : d));
    setShowModal(false);
  };

  return (
    <Layout title="Demandes Voiture - DMB">
      <div className="p-6 text-black">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Liste des demandes</h2>
          <table className="min-w-full table-auto text-sm shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Début</th>
                <th className="px-4 py-2 border">Fin</th>
                <th className="px-4 py-2 border">Chauffeur</th>
                <th className="px-4 py-2 border">Matricule Voiture</th>
                <th className="px-4 py-2 border">Statut DMB</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map(d => (
                <tr key={d.id} className="text-black">
                  <td className="px-4 py-2 border">{d.nom}</td>
                  <td className="px-4 py-2 border">{formatDateFr(d.date_debut)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(d.date_fin)}</td>
                  <td className="px-4 py-2 border">{d.chauffeur || "—"}</td>
                  <td className="px-4 py-2 border">{d.voiture_matricule || "—"}</td>
                  <td className="px-4 py-2 border">{d.status_dmb === 1 ? "✅ Acceptée" : "⏳ En attente"}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button onClick={() => { setSelectedDemande(d); setShowModal(true); }} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedDemande && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
              <h3 className="text-xl font-bold mb-4 text-center">Gérer la demande</h3>
              <p><strong>Nom:</strong> {selectedDemande.nom}</p>
              <p><strong>Début:</strong> {formatDateFr(selectedDemande.date_debut)}</p>
              <p><strong>Fin:</strong> {formatDateFr(selectedDemande.date_fin)}</p>
              <div className="my-4">
                <label className="block font-medium text-gray-700">Chauffeur</label>
                <select value={chauffeur} onChange={e => setChauffeur(e.target.value)} className="w-full border px-3 py-2 rounded">
                  <option value="">-- Choisir un chauffeur --</option>
                  {chauffeurs.map(c => (
                    <option key={c.IDT_MATAG} value={`${c.IDT_NOMAG} ${c.IDT_PRNAG}`}>
                      {c.IDT_NOMAG} {c.IDT_PRNAG}
                    </option>
                  ))}
                </select>
              </div>
              <div className="my-4">
                <label className="block font-medium text-gray-700">Matricule Voiture</label>
                <select value={voitureMatricule} onChange={e => setVoitureMatricule(e.target.value)} className="w-full border px-3 py-2 rounded">
  <option value="">-- Choisir une voiture --</option>
  {voitures.map(v => (
    <option key={v.id} value={v.matricule}>
      {v.matricule} - {v.marque} {v.modele}
    </option>
  ))}
</select>
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Valider
                </button>
                <button onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}