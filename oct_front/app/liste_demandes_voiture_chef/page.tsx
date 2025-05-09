"use client";

import { useSession } from "next-auth/react";
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

export default function ListeDemandesVoitureChefPage() {
  const { data: session } = useSession();
  const [demandes, setDemandes] = useState<DemandeVoiture[]>([]);
  const [selectedDemande, setSelectedDemande] = useState<DemandeVoiture | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDemandes = async () => {
    if (!session?.user?.departmentId) return;

    const res = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            demandesVoitureByDepartment(departmentId: "${session.user.departmentId}") {
              id nom matricule date_debut date_fin accompagnant status_chef status_dmb chauffeur voiture_matricule departmentId created_at updated_at
            }
          }
        `,
      }),
    });

    const result = await res.json();
    setDemandes(result.data?.demandesVoitureByDepartment || []);
  };

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const handleConfirm = async (status: number) => {
    if (!selectedDemande) return;

    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            updateStatusChefVoiture(id: ${selectedDemande.id}, status_chef: ${status}) {
              id
              status_chef
            }
          }
        `,
      }),
    });

    setDemandes((prev) =>
      prev.map((d) =>
        d.id === selectedDemande.id ? { ...d, status_chef: status } : d
      )
    );
    setShowModal(false);
  };

  const openModal = (demande: DemandeVoiture) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  useEffect(() => {
    fetchDemandes();
  }, [session]);

  return (
    <Layout title="Demandes Voiture - Chef">
      <div className="p-6 text-black">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Liste des demandes</h2>
          <table className="min-w-full table-auto text-sm shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Début</th>
                <th className="px-4 py-2 border">Fin</th>
                <th className="px-4 py-2 border">Accompagnant</th>
                <th className="px-4 py-2 border">Statut Chef</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="text-black">
                  <td className="px-4 py-2 border">{d.nom}</td>
                  <td className="px-4 py-2 border">{formatDateFr(d.date_debut)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(d.date_fin)}</td>
                  <td className="px-4 py-2 border">{d.accompagnant || "—"}</td>
                  <td className="px-4 py-2 border">
                    {d.status_chef === 1 ? "✅ Acceptée" : d.status_chef === -1 ? "❌ Refusée" : "⏳ En attente"}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => openModal(d)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
                    >
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
              <p><strong>Accompagnant:</strong> {selectedDemande.accompagnant || "—"}</p>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => handleConfirm(1)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleConfirm(-1)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Refuser
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
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