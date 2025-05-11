"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const translations = {
  ar: {
    title: "طلب توقف / استئناف",
    type: "النوع",
    selectType: "اختر نوع الطلب",
    typeOptions: {
      stop: "توقف",
      resume: "استئناف",
      permission: "إذن بالخروج",
    },
    fullName: "الاسم الكامل",
    department: "القسم",
    position: "المنصب",
    registrationNumber: "رقم التسجيل",
    reason: "السبب",
    reasonPlaceholder: "أدخل سبب التوقف أو الاستئناف",
    dateTime: "التاريخ والوقت",
    documents: "المستندات",
    submit: "إرسال الطلب",
    success: "تم إرسال الطلب بنجاح",
    error: "خطأ في إرسال الطلب",
    networkError: "خطأ في الشبكة",
  },
  fr: {
    title: "Demande Arrêt / Reprise",
    type: "Type",
    selectType: "Sélectionnez un type",
    typeOptions: {
      stop: "Arrêt",
      resume: "Reprise",
      permission: "Autorisation de Sortir",
    },
    fullName: "Nom Complet",
    department: "Département",
    position: "Poste",
    registrationNumber: "Numéro d'Enregistrement",
    reason: "Raison",
    reasonPlaceholder: "Entrez la raison de l'arrêt ou de la reprise",
    dateTime: "Date & Heure",
    documents: "Documents",
    submit: "Envoyer la demande",
    success: "Demande envoyée avec succès",
    error: "Erreur lors de l'envoi de la demande",
    networkError: "Erreur réseau",
  },
};

export default function DemandeArretReprisePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lang, setLang] = useState<"ar" | "fr">("ar");
  const t = translations[lang];

  const [position, setPosition] = useState("");
  const [reason, setReason] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [typeArret, setTypeArret] = useState<number | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const employeeName = `${session?.user?.prenom ?? ""} ${session?.user?.nom ?? ""}`;
  const department = session?.user?.department ?? "";
  const departmentId = session?.user?.departmentId?.toString().padStart(6, "0") ?? "";


  useEffect(() => {
    const fetchPosition = async () => {
      if (!session?.user?.matricule) return;

      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              ficheIdentite(idt_matag: "${session.user.matricule}") {
                POSITION
              }
            }`,
          }),
        });

        const result = await res.json();
        setPosition(result?.data?.ficheIdentite?.POSITION ?? "");
      } catch (err) {
        console.error("Erreur de récupération de la position:", err);
      }
    };

    fetchPosition();
  }, [session]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData();

    const operations = JSON.stringify({
      query: `
        mutation ($documents: [Upload]) {
          createArretReprise(
            employee_name: "${employeeName}",
            position: "${position}",
            department: "${department}",
            departmentId: "${departmentId}",
            matricule: "${session.user.matricule}",
            reason: "${reason}",
            date_time: "${formatDateTimeForGraphQL(dateTime)}",
            type_arret: ${typeArret},
            documents: $documents
          ) {
            id
          }
        }
      `,
      variables: { documents: new Array(files?.length ?? 0).fill(null) },
    });

    const map: Record<string, string[]> = {};
    if (files) {
      for (let i = 0; i < files.length; i++) {
        map[i] = [`variables.documents.${i}`];
      }
    }

    formData.append("operations", operations);
    formData.append("map", JSON.stringify(map));
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append(i.toString(), files[i]);
      }
    }

    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("GraphQL Response:", result);

      if (result.errors) {
        alert(t.error);
      } else {
        alert(t.success);
        router.push("/mes_arrets_reprises");
      }
    } catch (error) {
      console.error(t.networkError, error);
    }
  };

  return (
    <Layout title={t.title}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "ar" | "fr")}
            className="border px-3 py-1 rounded text-black text-sm"
          >
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-lg rounded-lg p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">
              {t.type} <span className="text-red-500">*</span>
            </label>
            <select
              value={typeArret ?? ""}
              onChange={(e) => setTypeArret(e.target.value ? Number(e.target.value) : null)}
              required
              className="w-full border px-3 py-2 rounded text-black text-right"
            >
              <option value="">{t.selectType}</option>
              <option value={0}>{t.typeOptions.stop}</option>
              <option value={1}>{t.typeOptions.resume}</option>
              <option value={2}>{t.typeOptions.permission}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">{t.reason}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded text-black text-right"
              placeholder={t.reasonPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">{t.dateTime}</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded text-black text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-right">{t.documents}</label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) setFiles(e.target.files);
              }}
              className="w-full text-black text-right"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#004571] text-white px-6 py-2 rounded hover:bg-[#003a5e] transition-colors"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}