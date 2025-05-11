"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  modules: { id: number; name: string }[];
}

const allModules = [
  { id: 1, name: "par défaut" },
  { id: 2, name: "chef congés" },
  { id: 3, name: "validateur RH" },
  { id: 4, name: "validateur DMB" },
  { id: 5, name: "Super admin" }
];

export default function ListeUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { allUsers { id nom prenom email modules { id name } } }`
      }),
    });
    const result = await res.json();
    setUsers(result.data?.allUsers || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchName.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleModuleChange = async (moduleId: number, checked: boolean) => {
    if (!selectedUser) return;

    const mutation = checked
      ? `mutation { assignModuleToUser(user_id: ${selectedUser.id}, module_id: ${moduleId}) { success } }`
      : `mutation { removeModuleFromUser(user_id: ${selectedUser.id}, module_id: ${moduleId}) { success } }`;

    await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation }),
    });

    fetchUsers();
    setSelectedModules((prev) =>
      checked ? [...prev, moduleId] : prev.filter((id) => id !== moduleId)
    );
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setSelectedModules(user.modules.map((m) => m.id));
    setShowModal(true);
  };

  return (
    <Layout title="Liste des utilisateurs">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Utilisateurs</h2>

          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setCurrentPage(1); // reset to page 1 when search changes
            }}
            className="mb-4 p-2 border rounded w-full text-black"
          />

          <table className="min-w-full table-auto text-sm bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Prénom</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition duration-200 text-black`}
                >
                  <td className="px-4 py-2 border">{user.nom}</td>
                  <td className="px-4 py-2 border">{user.prenom}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                      onClick={() => openModal(user)}
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
              Modules de {selectedUser.nom}
            </h3>
            <div className="space-y-4">
              {allModules.map((mod) => (
                <label key={mod.id} className="flex text-gray-500 items-center">
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(mod.id)}
                    onChange={(e) =>
                      handleModuleChange(mod.id, e.target.checked)
                    }
                    className="mr-2"
                  />
                  {mod.name}
                </label>
              ))}
            </div>
            <div className="flex justify-center mt-6">
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
    </Layout>
  );
}
