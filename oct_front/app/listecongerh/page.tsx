"use client";

import { useSession,  } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import jsPDF from "jspdf";

type Conge = {
  id: number;
  nom: string;
  prenom: string;
  datedebut: string;
  datefin: string;
  datedebutchef: string;
  datefinchef: string;
  duree: number;
  etatrh: number;
  certificat_url?: string;
  replacementName: string;
};

export default function ListecongerhPage() {
  const { data: session } = useSession();
  const [congeData, setCongeData] = useState<Conge[]>([]);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const calculateDuration = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const generatePDF = (conge: Conge) => {
    if (conge.etatrh === 0) {
      alert("Le congé n'a pas encore été accepté !");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(0, 69, 113);
    doc.text("Demande de Congé", 105, 20, { align: "center" });

    doc.setFontSize(12);
    let y = 40;
    const info = [
      ["Nom", conge.nom],
      ["Prénom", conge.prenom],
      ["Date début", conge.datedebut],
      ["Date fin", conge.datefin],
      ["Date début par chef", conge.datedebutchef],
      ["Date fin par chef", conge.datefinchef],
      ["Remplaçant", conge.replacementName],
      ["Durée", `${calculateDuration(conge.datedebutchef, conge.datefinchef)} jours`],
    ];

    info.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 20, y);
      y += 10;
    });

    doc.save(`Demande_Conge_${conge.nom}_${conge.prenom}.pdf`);
  };

  const handleConfirm = async (etat: 1 | 2) => {
    if (!selectedConge) return;

    try {
      await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation {
              updateCongeByRH(id: ${selectedConge.id}, etatrh: ${etat}) {
                id etatrh
              }
            }
          `,
        }),
      });

      setCongeData(prev =>
        prev.map(conge =>
          conge.id === selectedConge.id ? { ...conge, etatrh: etat } : conge
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  const openModal = (conge: Conge) => {
    setSelectedConge(conge);
    setShowModal(true);
  };

  useEffect(() => {
    if (!session) return;

    const fetchConges = async () => {
      try {
        const response = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                allConges {
                  id nom prenom datedebut datefin datedebutchef datefinchef
                  duree etatrh certificat_url replacementName
                }
              }
            `,
          }),
        });
        const result = await response.json();
        setCongeData(result.data?.allConges || []);
      } catch (error) {
        console.error("Erreur fetch RH:", error);
      }
    };

    fetchConges();
  }, [session]);

  return (
    <Layout title="Liste des Congés RH">
      <div className="p-6 pt-6 text-black">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Demandes de Congés - RH</h2>
          <table className="min-w-full table-auto text-sm shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Début</th>
                <th className="px-4 py-2 border">Fin</th>
                <th className="px-4 py-2 border">Début Chef</th>
                <th className="px-4 py-2 border">Fin Chef</th>
                <th className="px-4 py-2 border">Durée</th>
                <th className="px-4 py-2 border">Remplaçant</th>
                <th className="px-4 py-2 border">Certificat</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {congeData.map((conge) => (
                <tr key={conge.id} className="text-black">
                  <td className="px-4 py-2 border">{conge.nom}</td>
                  <td className="px-4 py-2 border">{conge.prenom}</td>
                  <td className="px-4 py-2 border">{formatDateFr(conge.datedebut)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(conge.datefin)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(conge.datedebutchef)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(conge.datefinchef)}</td>
                  <td className="px-4 py-2 border">{calculateDuration(conge.datedebutchef, conge.datefinchef)} jrs</td>
                  <td className="px-4 py-2 border">{conge.replacementName}</td>
                  <td className="px-4 py-2 border text-center">
                    {conge.certificat_url ? (
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => window.open(conge.certificat_url, '_blank')}
                        >
                          Afficher
                        </button>
                        <a
                          href={conge.certificat_url}
                          download
                          className="text-green-600 underline hover:text-green-800"
                        >
                          Télécharger
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Aucun certificat</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => openModal(conge)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    >
                      Gérer
                    </button>
                    <button
                      onClick={() => generatePDF(conge)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Modal RH */}
        {showModal && selectedConge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
              <h3 className="text-xl font-bold mb-4 text-center">Gérer la demande</h3>
              <p><strong>Nom:</strong> {selectedConge.nom}</p>
              <p><strong>Prénom:</strong> {selectedConge.prenom}</p>
              <p><strong>Début:</strong> {selectedConge.datedebutchef.split("T")[0]}</p>
              <p><strong>Fin:</strong> {selectedConge.datefinchef.split("T")[0]}</p>
              <p><strong>Durée:</strong> {calculateDuration(selectedConge.datedebutchef, selectedConge.datefinchef)} jours</p>
              <p><strong>Remplaçant:</strong> {selectedConge.replacementName}</p>

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => handleConfirm(1)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleConfirm(2)}
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
