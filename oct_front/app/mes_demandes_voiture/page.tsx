"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function MesDemandesVoiturePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<DemandeVoiture[]>([]);

  useEffect(() => {
    const fetchDemandes = async () => {
      if (!session?.user?.matricule) return;

      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              demandesVoitureByMatricule(matricule: "${session.user.matricule}") {
                id
                nom
                matricule
                date_debut
                date_fin
                accompagnant
                status_chef
                status_dmb
                chauffeur
                voiture_matricule
                departmentId
                created_at
                updated_at
              }
            }
          `,
        }),
      });

      const result = await res.json();
      setDemandes(result?.data?.demandesVoitureByMatricule ?? []);
    };

    fetchDemandes();
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <Layout title="Mes Demandes de Voiture">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Liste de mes demandes</h2>
        <button
          onClick={() => router.push("/demande_voiture")}
          className="bg-[#004571] hover:bg-[#003a5e] text-white px-4 py-2 rounded"
        >
          + Nouvelle demande
        </button>
      </div>

      {demandes.length === 0 ? (
        <p className="text-gray-600">Aucune demande trouvée.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <thead className="bg-blue-100 text-gray-800">
            <tr>
              <th className="p-2 border">Date début</th>
              <th className="p-2 border">Date fin</th>
              <th className="p-2 border">Accompagnant</th>
              <th className="p-2 border">Statut Chef</th>
              <th className="p-2 border">Statut DMB</th>
              <th className="p-2 border">Chauffeur</th>
              <th className="p-2 border">Voiture</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id} className="text-center border-t hover:bg-gray-50">
                <td className="p-2 border">{formatDate(d.date_debut)}</td>
                <td className="p-2 border">{formatDate(d.date_fin)}</td>
                <td className="p-2 border">{d.accompagnant || "—"}</td>
                <td className="p-2 border">
                  {d.status_chef === 1 ? "✅ Acceptée" : d.status_chef === -1 ? "❌ Refusée" : "⏳ En attente"}
                </td>
                <td className="p-2 border">
                  {d.status_dmb === 1 ? "✅ Acceptée" : d.status_dmb === -1 ? "❌ Refusée" : "⏳ En attente"}
                </td>
                <td className="p-2 border">{d.chauffeur || "—"}</td>
                <td className="p-2 border">{d.voiture_matricule || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
