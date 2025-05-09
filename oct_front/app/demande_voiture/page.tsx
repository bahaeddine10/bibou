"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserMinimal {
  matricule: string;
  nom: string;
  prenom: string;
}

export default function DemandeVoiturePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [accompagnant, setAccompagnant] = useState("");

  const nomComplet = `${session?.user?.prenom ?? ""} ${session?.user?.nom ?? ""}`;
  const matricule = session?.user?.matricule ?? "";
  const departmentId = session?.user?.departmentId?.toString().padStart(6, "0") ?? "";

  const formatDateTimeForGraphQL = (isoString: string) => {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = "00";
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  useEffect(() => {
    if (!session?.user?.matricule) return;

    const fetchUsers = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              activeUsers {
                matricule
                nom
                prenom
              }
            }
          `,
        }),
      });

      const result = await res.json();
      setUsers(result?.data?.activeUsers ?? []);
    };

    fetchUsers();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const res = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            createDemandeVoiture(
              nom: "${nomComplet}",
              matricule: "${matricule}",
              date_debut: "${formatDateTimeForGraphQL(dateDebut)}",
              date_fin: "${formatDateTimeForGraphQL(dateFin)}",
              accompagnant: "${accompagnant}",
              departmentId: "${departmentId}"
            ) {
              id
            }
          }
        `,
      }),
    });

    const result = await res.json();
    if (result.errors) {
      alert("❌ Erreur lors de la création de la demande.");
      console.error(result.errors);
    } else {
      alert("✅ Demande voiture envoyée !");
      router.push("/mes_demandes_voiture");
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Demande de Voiture">
      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-lg rounded-lg p-6">
          <div>
            <label className="block font-medium text-gray-700">Date & Heure de départ</label>
            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Date & Heure de retour</label>
            <input
              type="datetime-local"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Accompagnant (facultatif)</label>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-2 border px-3 py-2 rounded"
            />
            <select
              value={accompagnant}
              onChange={(e) => setAccompagnant(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Aucun --</option>
              {filteredUsers.map((user) => (
                <option key={user.matricule} value={`${user.prenom} ${user.nom}`}>
                  {user.prenom} {user.nom}
                </option>
              ))}
            </select>
            {accompagnant && (
  <div className="mt-4 p-2 border rounded bg-gray-50">
    <p className="font-semibold mb-1">👤 Accompagnant sélectionné :</p>
    <p>{accompagnant}</p>
  </div>
)}

          </div>

          <button
            type="submit"
            className="bg-[#004571] text-white px-6 py-2 rounded hover:bg-[#003a5e]"
          >
            Envoyer la demande
          </button>
        </form>
      </div>
    </Layout>
  );
}
