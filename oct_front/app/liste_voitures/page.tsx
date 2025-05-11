"use client";

import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Voiture {
  id: number;
  matricule: string;
  marque: string;
  modele: string;
  disponibilite: number;
}

const translations = {
  ar: {
    title: "قائمة السيارات",
    matricule: "رقم التسجيل",
    marque: "الماركة",
    modele: "الموديل",
    disponibilite: "متاحة؟",
    oui: "نعم",
    non: "لا",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه السيارة ؟",
    ajouter: "إضافة سيارة"
  },
  fr: {
    title: "Liste des Voitures",
    matricule: "Matricule",
    marque: "Marque",
    modele: "Modèle",
    disponibilite: "Disponible ?",
    oui: "Oui",
    non: "Non",
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette voiture ?",
    ajouter: "Ajouter une voiture"
  },
};

export default function ListeVoituresPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "fr">("ar");
  const t = translations[lang];
  const [voitures, setVoitures] = useState<Voiture[]>([]);

  useEffect(() => {
    fetchVoitures();
  }, []);

  const fetchVoitures = async () => {
    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              allVoitures {
                id
                matricule
                marque
                modele
                disponibilite
              }
            }
          `,
        }),
      });

      const json = await res.json();
      setVoitures(json.data.allVoitures || []);
    } catch (err) {
      console.error("Erreur lors du chargement des voitures :", err);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm(t.confirmDelete);
    if (!confirm) return;

    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              deleteVoiture(id: ${id})
            }
          `,
        }),
      });

      const json = await res.json();
      if (json.data?.deleteVoiture) {
        setVoitures(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  return (
    <Layout title={t.title}>
      <div className="p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "ar" | "fr")}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-right">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2">{t.matricule}</th>
                <th className="px-4 py-2">{t.marque}</th>
                <th className="px-4 py-2">{t.modele}</th>
                <th className="px-4 py-2">{t.disponibilite}</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {voitures.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-2 text-black">{v.matricule}</td>
                  <td className="px-4 py-2 text-black">{v.marque}</td>
                  <td className="px-4 py-2 text-black">{v.modele}</td>
                  <td className="px-4 py-2 text-black">{v.disponibilite === 1 ? t.oui : t.non}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => router.push(`/update_voiture?id=${v.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {voitures.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center px-4 py-4 text-gray-500">
                    Aucune voiture trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => router.push("/create_voiture")}
          className="fixed bottom-6 right-6 bg-[#004571] hover:bg-[#003a5e] text-white rounded-full p-4 shadow-lg text-xl"
          title={t.ajouter}
        >
          ➕
        </button>
      </div>
    </Layout>
  );
}
