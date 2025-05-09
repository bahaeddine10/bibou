"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const translations = {
  ar: {
    title: "تحديث سيارة",
    matricule: "رقم التسجيل",
    marque: "الماركة",
    modele: "الموديل",
    disponibilite: "متاحة؟",
    oui: "نعم",
    non: "لا",
    submit: "تحديث",
    success: "تم التحديث بنجاح",
    error: "حدث خطأ أثناء التحديث",
    notfound: "لم يتم العثور على السيارة"
  },
  fr: {
    title: "Modifier Voiture",
    matricule: "Matricule",
    marque: "Marque",
    modele: "Modèle",
    disponibilite: "Disponible ?",
    oui: "Oui",
    non: "Non",
    submit: "Mettre à jour",
    success: "Voiture mise à jour avec succès",
    error: "Erreur lors de la mise à jour",
    notfound: "Voiture introuvable"
  },
};

export default function UpdateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [lang, setLang] = useState<"ar" | "fr">("ar");
  const t = translations[lang];

  const [matricule, setMatricule] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [disponibilite, setDisponibilite] = useState(1);

  useEffect(() => {
    const fetchVoiture = async () => {
      if (!id) return;

      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                voiture(id: ${id}) {
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
        const v = json.data?.voiture;

        if (!v) {
          alert(t.notfound);
          router.push("/liste_voitures");
        } else {
          setMatricule(v.matricule);
          setMarque(v.marque);
          setModele(v.modele);
          setDisponibilite(v.disponibilite);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la voiture :", err);
      }
    };

    fetchVoiture();
  }, [id, t.notfound, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              updateVoiture(
                id: ${id},
                matricule: "${matricule}",
                marque: "${marque}",
                modele: "${modele}",
                disponibilite: ${disponibilite}
              ) {
                id
              }
            }
          `,
        }),
      });

      const json = await res.json();
      if (json.data?.updateVoiture?.id) {
        alert(t.success);
        router.push("/liste_voitures");
      } else {
        alert(t.error);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      alert(t.error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "ar" | "fr")}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block font-medium">{t.matricule}</label>
          <input
            type="text"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">{t.marque}</label>
          <input
            type="text"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">{t.modele}</label>
          <input
            type="text"
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">{t.disponibilite}</label>
          <select
            value={disponibilite}
            onChange={(e) => setDisponibilite(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value={1}>{t.oui}</option>
            <option value={0}>{t.non}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#004571] hover:bg-[#003a5e] text-white px-6 py-2 rounded"
          >
            {t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
