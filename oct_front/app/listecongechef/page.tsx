"use client";

import { useSession,  } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

type Conge = {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  datedebut: string;
  datefin: string;
  duree: number;
  etatchef: number;
  certificat_url?: string;
  replacementName?: string;
  replacementMatricule?: number;
  datedebutchef?: string;
  datefinchef?: string;
  chefID?: string;
  chefName?: string;
};

export default function ListecongechefPage() {
  const { data: session } = useSession();

  const [, setUserName] = useState('');
  const [congeData, setCongeData] = useState<Conge[]>([]);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [replacements, setReplacements] = useState<{ nom: string; prenom: string; matricule: number }[]>([]);
  const [selectedReplacement, setSelectedReplacement] = useState<{ nom: string; prenom: string; matricule: number } | null>(null);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    if (!session) return;

    setUserName(`${session.user?.prenom || ''} ${session.user?.nom || ''}`);

    const fetchConges = async () => {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query {
              congesByDepartment(departmentId: "${session.user.departmentId}") {
                id nom prenom matricule datedebut datefin duree etatchef
                datedebutchef datefinchef certificat_url
              }
            }
          `,
        }),
      });
      const result = await response.json();
      setCongeData(result.data?.congesByDepartment || []);
    };

    fetchConges();
  }, [session]);
  

  const fetchReplacements = async () => {
    if (!session?.user.departmentId || !selectedConge?.matricule) return;
  
    const departmentId = String(session.user.departmentId).padStart(6, "0");
const query = `
  query {
    usersByDepartment(departmentId: "${departmentId}", matricule: "${selectedConge.matricule}") {
      matricule
      nom
      prenom
    }
  }
`;

  
    console.log("🧠 Query sent to server:\n", query);
  
    const response = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  
    const result = await response.json();
    console.log("✅ Remplaçants récupérés:", result.data?.usersByDepartment);
  
    setReplacements(result.data?.usersByDepartment || []);
  };
  

  useEffect(() => {
    if (selectedConge) fetchReplacements();
  }, [selectedConge, fetchReplacements]);

  const openModal = (conge: Conge) => {
    setSelectedConge(conge);
    const formatDateOnly = (fullDate: string) => fullDate.split(" ")[0];
    setNewStartDate(formatDateOnly(conge.datedebut));
    setNewEndDate(formatDateOnly(conge.datefin));
    setSelectedReplacement(null);
    setShowModal(true);
  };

  const handleUpdateConge = async (etatchef: 1 | 2) => {
    if (!selectedConge || !session?.user) return;

    let mutation = "";
    if (etatchef === 2) {
      mutation = `
        mutation {
          updateCongeByChef(
            id: ${selectedConge.id},
            etatchef: 2,
            chefID: ${session.user.matricule},
            chefName: "${session.user.nom} ${session.user.prenom}"
          ) {
            id etatchef
          }
        }
      `;
    } else {
      const replacementName = selectedReplacement
        ? `${selectedReplacement.nom} ${selectedReplacement.prenom}`
        : "";
      const replacementMatricule = selectedReplacement?.matricule || 0;

      mutation = `
        mutation {
          updateCongeByChef(
            id: ${selectedConge.id},
            datedebutchef: "${newStartDate} 00:00:00",
            datefinchef: "${newEndDate} 00:00:00",
            duree: ${calculateDuration(newStartDate, newEndDate)},
            etatchef: 1,
            replacementName: "${replacementName}",
            replacementMatricule: ${replacementMatricule},
            chefID: ${session.user.matricule},
            chefName: "${session.user.nom} ${session.user.prenom}"
          ) {
            id datedebutchef datefinchef duree etatchef replacementName replacementMatricule
          }
        }
      `;
    }

    const response = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation }),
    });

    const result = await response.json();
    const updated = result.data?.updateCongeByChef;
    if (updated) {
      setCongeData(prev =>
        prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)
      );
    }

    setShowModal(false);
  };

  return (
    <Layout title="Liste des Congés Chef">
      <div className="p-6 pt-6 text-black">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Demandes de votre département</h2>

          <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Date début</th>
                <th className="px-4 py-2 border">Date fin</th>
                <th className="px-4 py-2 border">Durée</th>
                <th className="px-4 py-2 border">Certificat</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {congeData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition text-black">
                  <td className="px-4 py-2 border">{row.nom}</td>
                  <td className="px-4 py-2 border">{row.prenom}</td>
                  <td className="px-4 py-2 border">{formatDateFr(row.datedebut)}</td>
                  <td className="px-4 py-2 border">{formatDateFr(row.datefin)}</td>
                  <td className="px-4 py-2 border">{row.duree} jours</td>
                  <td className="px-4 py-2 border text-center">
                    {row.certificat_url ? (
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() => window.open(row.certificat_url, '_blank')}
                        >
                          Afficher
                        </button>
                        <a href={row.certificat_url} download className="text-green-600 underline hover:text-green-800">
                          Télécharger
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Aucun certificat</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {row.etatchef === 0 ? (
                      <button
                        onClick={() => openModal(row)}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      >
                        Gérer
                      </button>
                    ) : (
                      <span>{row.etatchef === 1 ? "✅" : "❌"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedConge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-white p-8 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-6 text-center text-gray-800">Gérer la demande</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-700">Date début</label>
                  <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className="border w-full p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Date fin</label>
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className="border w-full p-2 rounded" />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">Remplaçant</label>
                  <select
                    className="border w-full p-2 rounded"
                    onChange={(e) => {
                      const selected = replacements.find(r => r.matricule.toString() === e.target.value);
                      setSelectedReplacement(selected || null);
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Choisir un remplaçant --</option>
                    {replacements.map(rep => (
                      <option key={rep.matricule} value={rep.matricule}>
                        {rep.nom} {rep.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between mt-6">
                  <button onClick={() => handleUpdateConge(1)} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                    Accepter
                  </button>
                  <button onClick={() => handleUpdateConge(2)} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                    Refuser
                  </button>
                  <button onClick={() => setShowModal(false)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
