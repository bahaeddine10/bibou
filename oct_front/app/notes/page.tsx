"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Combobox } from '@headlessui/react';

interface FormData {
  year: string;
  notes: {
    trimestre1: string;
    trimestre2: string;
    trimestre3: string;
    trimestre4: string;
  };
  note: string;
}

type UserMinimal = {
  matricule: string;
  nom: string;
  prenom: string;
};

type Note = {
  id: string;
  matricule: string;
  annee: number;
  noteAnnTr1: string;
  noteAnnTr2: string;
  noteAnnTr3: string;
  noteAnnTr4: string;
  note: string;
};

export default function NotesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [formData, setFormData] = useState<FormData>({
    year: new Date().getFullYear().toString(),
    notes: {
      trimestre1: '',
      trimestre2: '',
      trimestre3: '',
      trimestre4: ''
    },
    note: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccompagnants, setSelectedAccompagnants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
            activeUsers {
              matricule
              nom
              prenom
            }
          }`,
        }),
      });

      const result = await res.json();
      setUsers(result?.data?.activeUsers ?? []);
    };

    const fetchCurrentNotes = async () => {
      if (!session?.user?.matricule) return;
      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              notes(matricule: "${session.user.matricule}", annee: ${new Date().getFullYear()}) {
                id
                matricule
                annee
                noteAnnTr1
                noteAnnTr2
                noteAnnTr3
                noteAnnTr4
                note
              }
            }`,
          }),
        });
        const result = await res.json();
        const notes = result.data?.notes?.[0];
        if (notes) {
          setFormData({
            year: notes.annee.toString(),
            notes: {
              trimestre1: notes.noteAnnTr1 || '',
              trimestre2: notes.noteAnnTr2 || '',
              trimestre3: notes.noteAnnTr3 || '',
              trimestre4: notes.noteAnnTr4 || ''
            },
            note: notes.note || ''
          });
        }
      } catch (err) {
        console.error("❌ Erreur de récupération des notes:", err);
      }
    };

    fetchUsers();
    fetchCurrentNotes();
  }, [session]);

  const handleAccompagnantToggle = (fullName: string) => {
    setSelectedAccompagnants((prev) =>
      prev.includes(fullName)
        ? prev.filter((name) => name !== fullName)
        : [...prev, fullName]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateNotes($input: UpdateNotesInput!) {
              updateNotes(input: $input) {
                id
                matricule
                annee
                note
                noteAnnTr1
                noteAnnTr2
                noteAnnTr3
                noteAnnTr4
                updated_at
              }
            }
          `,
          variables: {
            input: {
              matricule: session?.user?.matricule || '',
              annee: parseInt(formData.year),
              note: formData.note,
              noteAnnTr1: formData.notes.trimestre1,
              noteAnnTr2: formData.notes.trimestre2,
              noteAnnTr3: formData.notes.trimestre3,
              noteAnnTr4: formData.notes.trimestre4
            }
          }
        })
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setFormData({
        year: result.data?.updateNotes.annee.toString(),
        notes: {
          trimestre1: result.data?.updateNotes.noteAnnTr1 || '',
          trimestre2: result.data?.updateNotes.noteAnnTr2 || '',
          trimestre3: result.data?.updateNotes.noteAnnTr3 || '',
          trimestre4: result.data?.updateNotes.noteAnnTr4 || ''
        },
        note: result.data?.updateNotes.note || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('trimestre')) {
      setFormData((prev: FormData) => ({
        ...prev,
        notes: {
          ...prev.notes,
          [name]: value
        }
      }));
    } else {
      setFormData((prev: FormData) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Gestion des Notes">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Gestion des Notes</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block mb-1">الأشخاص المرافقين</label>
            <Combobox value={selectedAccompagnants} onChange={setSelectedAccompagnants} multiple>
              <div className="relative">
                <div className="relative w-full">
                  <Combobox.Input
                    className="w-full border p-2 rounded"
                    placeholder="🔍 البحث..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                    displayValue={(items: string[]) => items.join(', ')}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredUsers.length === 0 ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                      لا يوجد نتائج
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const fullName = `${user.prenom} ${user.nom}`;
                      return (
                        <Combobox.Option
                          key={user.matricule}
                          value={fullName}
                          className={({ active, selected }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-blue-600 text-white' : 'text-gray-900'
                            } ${selected ? 'bg-blue-100' : ''}`
                          }
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {fullName}
                              </span>
                              {selected && (
                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                  active ? 'text-white' : 'text-blue-600'
                                }`}>
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      );
                    })
                  )}
                </Combobox.Options>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAccompagnants.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => handleAccompagnantToggle(name)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Combobox>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Année
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              readOnly
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Note Globale
            </label>
            <input
              type="text"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="trimestre1" className="block text-sm font-medium text-gray-700">
              Notes - Trimestre 1
            </label>
            <input
              type="text"
              id="trimestre1"
              name="trimestre1"
              value={formData.notes.trimestre1}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="trimestre2" className="block text-sm font-medium text-gray-700">
              Notes - Trimestre 2
            </label>
            <input
              type="text"
              id="trimestre2"
              name="trimestre2"
              value={formData.notes.trimestre2}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="trimestre3" className="block text-sm font-medium text-gray-700">
              Notes - Trimestre 3
            </label>
            <input
              type="text"
              id="trimestre3"
              name="trimestre3"
              value={formData.notes.trimestre3}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="trimestre4" className="block text-sm font-medium text-gray-700">
              Notes - Trimestre 4
            </label>
            <input
              type="text"
              id="trimestre4"
              name="trimestre4"
              value={formData.notes.trimestre4}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
