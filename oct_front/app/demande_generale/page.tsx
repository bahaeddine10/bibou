"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TypeDemande {
  id: number;
  name: string;
}

export default function DemandeGeneralePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [type, setType] = useState<number | "">("");
  const [typesOptions, setTypesOptions] = useState<TypeDemande[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [fonction, setFonction] = useState("");

  // 🔎 Récupérer les types de demande
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              allTypesDemandeGenerale {
                id
                name
              }
            }`,
          }),
        });
        const json = await res.json();
        setTypesOptions(json.data.allTypesDemandeGenerale || []);
      } catch (error) {
        console.error("❌ Error fetching types:", error);
      }
    };

    fetchTypes();
  }, []);

  // 🔎 Récupérer la fonction de l'utilisateur
  useEffect(() => {
    const fetchFonction = async () => {
      if (!session?.user?.matricule) return;
      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              ficheIdentite(idt_matag: "${session.user.matricule}") {
                FONCTION
              }
            }`,
          }),
        });
        const json = await res.json();
        setFonction(json.data?.ficheIdentite?.FONCTION ?? "");
      } catch (err) {
        console.error("❌ Error fetching fonction:", err);
      }
    };

    fetchFonction();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || type === "") return;

    try {
      const mutation = `
        mutation {
          createDemandeGenerale(
            nom: "${session.user.nom}",
            prenom: "${session.user.prenom}",
            matricule: "${session.user.matricule}",
            type: ${type},
            department: "${session.user.department}",
            fonction: "${fonction}"
          ) {
            id
          }
        }
      `;

      console.log("📤 Mutation sent:", mutation);

      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: mutation }),
      });

      const result = await res.json();
      if (result.errors) {
        setErrorMessage("❌ Une erreur est survenue lors de l'envoi.");
        console.error(result.errors);
      } else {
        alert("✅ Demande générale envoyée avec succès !");
        router.push("/mes_demandes_generales");
      }
    } catch (error) {
      console.error("❌ Submission error:", error);
      setErrorMessage("❌ Erreur lors de la soumission.");
    }
  };

  return (
    <Layout title="Demande Générale">
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-4">📨 Nouvelle Demande Générale</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Type de Demande</label>
              <select
                value={type}
                onChange={(e) => setType(parseInt(e.target.value))}
                required
                className="w-full border p-2 rounded bg-white text-black"
              >
                <option value="">-- Choisir un type --</option>
                {typesOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage && (
              <div className="bg-red-100 text-red-800 p-2 rounded text-sm">{errorMessage}</div>
            )}

            <div className="text-right">
              <button
                type="submit"
                className="bg-[#004571] text-white font-bold py-2 px-6 rounded hover:bg-[#003a5e] transition"
              >
                Envoyer la Demande
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
