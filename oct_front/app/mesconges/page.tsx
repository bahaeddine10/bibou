"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface Conge {
  id: number;
  nom: string;
  prenom: string;
  datedebut: string;
  datefin: string;
  duree: number;
  etatchef: string;
  etatrh: string;
  type_label: string;
  type_label_ar: string;
  type: "conge";
}

interface MvtConge {
  idt_matag: string;
  mvc_datdeb: string;
  mvc_datfin: string;
  type_label: string;
  type_label_ar: string;
  type: "mvtconge";
}

type CombinedConge = Conge | MvtConge;

interface GraphQLCongeResponse {
  data: {
    congesByMatricule: Omit<Conge, "type" | "type_label_ar">[];
  };
}

interface GraphQLMvtResponse {
  data: {
    mvtconByMatricule: Omit<MvtConge, "type" | "type_label_ar">[];
  };
}

export default function CombinedCongesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [combined, setCombined] = useState<CombinedConge[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const renderStatusIcon = (status: string | number | null) => {
    if (status === null || status === "null") return "✅";
    if (status === 1 || status === "1") return "✅";
    if (status === 0 || status === "0") return "⏳";
    if (status === 2 || status === "2") return "❌";
    return "";
  };

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`´]/g, "'")
      .trim()
      .toLowerCase();

  const typeConges = [
    { fr: "conge except", ar: "عطلة إستثنائية" },
    { fr: "AT", ar: "حادث شغل" },
    { fr: "PRENATALE", ar: "عطلة ولادة" },
    { fr: "CM", ar: "عطلة مرضية" },
    { fr: "Congé َ Annuel", ar: "عطلة سنوية" },
    { fr: "Régul, absence", ar: "تسوية غياب" },
  ];

  const mapTypeLabelAr = (typeFr: string): string => {
    const normalized = normalize(typeFr);
    return typeConges.find((t) => normalize(t.fr) === normalized)?.ar || "";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.matricule) return;
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      try {
        const [res1, res2] = await Promise.all([
          fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query {
                congesByMatricule(matricule: "${session.user.matricule}") {
                  id nom prenom datedebut datefin duree etatchef etatrh type_label type_label_ar
                }
              }`,
            }),
          }),
          fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query {
                mvtconByMatricule(matricule: "${session.user.matricule}") {
                  idt_matag mvc_datdeb mvc_datfin type_label type_label_ar
                }
              }`,
            }),
          }),
        ]);

        const data1: GraphQLCongeResponse = await res1.json();
        const data2: GraphQLMvtResponse = await res2.json();

        const conges: Conge[] = data1.data.congesByMatricule.map((c) => ({
          ...c,
          type: "conge",
          type_label_ar: mapTypeLabelAr(c.type_label),
        }));

        const mvt: MvtConge[] = data2.data.mvtconByMatricule.map((m) => ({
          ...m,
          type: "mvtconge",
          type_label_ar: mapTypeLabelAr(m.type_label),
        }));

        setCombined([
          ...conges.filter((c) => new Date(c.datedebut) >= threeYearsAgo),
          ...mvt.filter((m) => new Date(m.mvc_datdeb) >= threeYearsAgo),
        ]);
      } catch (err) {
        console.error("❌ Error while fetching:", err);
      }
    };

    fetchData();
  }, [session, mapTypeLabelAr]);

  const filtered = combined.filter((c) => {
    const d1 = c.type === "conge" ? c.datedebut : c.mvc_datdeb;
    const d2 = c.type === "conge" ? c.datefin : c.mvc_datfin;
    return d1.includes(searchTerm) || d2.includes(searchTerm);
  }).sort((a, b) => {
    const dateA = new Date(a.type === "conge" ? a.datedebut : a.mvc_datdeb).getTime();
    const dateB = new Date(b.type === "conge" ? b.datedebut : b.mvc_datdeb).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const items = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Layout title="Mes Congés">
      <div className="p-6 pt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <input
              type="text"
              placeholder="Search by date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded bg-white text-black shadow-sm"
            />
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border rounded bg-white hover:bg-blue-100 text-black shadow-sm"
            >
              Trier {sortOrder === "asc" ? "↓" : "↑"}
            </button>
          </div>

          <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-2 border">Date Début</th>
                <th className="px-4 py-2 border">Date Fin</th>
                <th className="px-4 py-2 border">Durée (Jours)</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">النوع</th>
                <th className="px-4 py-2 border">Status Chef</th>
                <th className="px-4 py-2 border">Status RH</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, i) => (
                <tr key={i} className="text-center border text-black bg-white hover:bg-gray-50">
                  <td className="px-4 py-2 border">{formatDateFr(c.type === "conge" ? c.datedebut : c.mvc_datdeb)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(c.type === "conge" ? c.datefin : c.mvc_datfin)}</td>
                  <td className="px-4 py-2 border">
                    {c.type === "conge" ? c.duree : calculateDuration(c.mvc_datdeb, c.mvc_datfin)}
                  </td>
                  <td className="px-4 py-2 border">{c.type_label}</td>
                  <td className="px-4 py-2 border">{c.type_label_ar}</td>
                  <td className="px-4 py-2 border">{c.type === "conge" ? renderStatusIcon(c.etatchef) : "✅"}</td>
                  <td className="px-4 py-2 border">{c.type === "conge" ? renderStatusIcon(c.etatrh) : "✅"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center mt-6 space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => router.push("/demande_conge")}
          className="bg-[#004571] hover:bg-[#005f8f] text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Demander un Congé
        </button>
      </div>
    </Layout>
  );
}
