"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface DemandeGenerale {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  type: number;
  type_label: string;
  status: string;
  date_soumission: string;
  date_traitement: string | null;
  document: string | null;
  department: string;
  fonction: string;
}

export default function ListeDemandesGeneralesPage() {
  const [demandes, setDemandes] = useState<DemandeGenerale[]>([]);
  const [selected, setSelected] = useState<DemandeGenerale | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query {
          allDemandesGenerales {
            id
            nom
            prenom
            matricule
            type
            type_label
            status
            date_soumission
            date_traitement
            document
            department
            fonction
          }
        }`,
      }),
    })
      .then((res) => res.json())
      .then((data) => setDemandes(data.data.allDemandesGenerales));
  }, []);

  const handleConfirm = async () => {
    if (!selected || !documentFile) return;

    const formData = new FormData();
    const mutation = `
      mutation ($document: Upload!) {
        updateDemandeGenerale(id: ${selected.id}, status: "1", document: $document) {
          id
          status
          document
        }
      }
    `;

    const variables = { document: null };
    const operations = JSON.stringify({ query: mutation, variables });
    const map = JSON.stringify({ "0": ["variables.document"] });

    formData.append("operations", operations);
    formData.append("map", map);
    formData.append("0", documentFile);

    console.log("📤 Mutation sent:", mutation);
    console.log("📦 Variables:", variables);
    console.log("📁 File name:", documentFile.name);
    console.log("📄 Full FormData:", [...formData.entries()]);

    try {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("✅ Server Response:", result);

      if (result.errors) {
        console.error("❌ GraphQL Errors:", result.errors);
      } else {
        setDemandes((prev) =>
          prev.map((d) =>
            d.id === selected.id
              ? {
                  ...d,
                  status: "1",
                  document: `${selected.id}.${documentFile.name.split(".").pop()}`,
                }
              : d
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error("🚨 Network Error:", err);
    }
  };

  return (
    <Layout title="Demandes Générales RH">
      <div className="p-6 text-black">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Liste des demandes générales</h2>
          <table className="min-w-full table-auto text-sm shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Département</th>
                <th className="px-4 py-2 border">Fonction</th>
                <th className="px-4 py-2 border">Statut</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="text-black text-center">
                  <td className="px-4 py-2 border">{d.nom} {d.prenom}</td>
                  <td className="px-4 py-2 border">{d.type_label}</td>
                  <td className="px-4 py-2 border">{d.department}</td>
                  <td className="px-4 py-2 border">{d.fonction}</td>
                  <td className="px-4 py-2 border">
                    {d.status === "0" ? "⏳ En attente" : d.status === "1" ? "✅ Acceptée" : "❌ Refusée"}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => { setSelected(d); setShowModal(true); }}
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

        {showModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
              <h3 className="text-xl font-bold mb-4 text-center">Gérer la demande</h3>
              <p><strong>Nom:</strong> {selected.nom} {selected.prenom}</p>
              <p><strong>Type:</strong> {selected.type_label}</p>
              <div className="my-4">
                <label className="block font-medium text-gray-700">Document</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setDocumentFile(e.target.files[0]);
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={handleConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Valider
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
