"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CongeMaladiePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const hasModule = (moduleId: number): boolean => {
    return session?.user?.modules?.some((m) => m.id === moduleId) ?? false;
  };
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleNavigation = (item: string) => {
    const routes: { [key: string]: string } = {
      "Dashboard": "/dashboard",
      "Liste des Congés": "/mesconges",
      "Fiche de paie": "/fiche_de_paie"
    };
    router.push(routes[item] || "/");
  };

  const handleDisconnect = () => {
    localStorage.clear();
    signOut({ callbackUrl: "/" });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    if (start && end && startDateObj <= endDateObj) {
      const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays);
    } else {
      setDuration(null);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (endDate) calculateDuration(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (startDate) calculateDuration(startDate, e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !file) {
      alert("Veuillez remplir toutes les informations et joindre le certificat médical !");
      return;
    }
  
    try {
      // 1. Upload the file first
      const uploadData = new FormData();
      uploadData.append('file', file);
  
      const uploadResponse = await fetch('http://localhost:8000/api/upload-certificat', {
        method: 'POST',
        body: uploadData,
      });
  
      const uploadResult = await uploadResponse.json();
      if (uploadResult.error) throw new Error(uploadResult.error);
  
      const certificatPath = uploadResult.path; // like 'certificats/myfile.jpg'
  
      // 2. Then send the GraphQL mutation
      const graphqlQuery = {
        query: `
          mutation CreateConge($nom: String!, $prenom: String!, $matricule: String!, $datedebut: DateTime!, $datefin: DateTime!, $duree: Float!, $etatchef: Int!, $etatrh: Int!, $typeconge: Int!, $certificat: String) {
            createConge(
              nom: $nom,
              prenom: $prenom,
              matricule: $matricule,
              datedebut: $datedebut,
              datefin: $datefin,
              duree: $duree,
              etatchef: $etatchef,
              etatrh: $etatrh,
              typeconge: $typeconge,
              certificat: $certificat
            ) {
              id
            }
          }
        `,
        variables: {
          nom: session?.user?.nom,
          prenom: session?.user?.prenom,
          matricule: session?.user?.matricule,
          datedebut: startDate,
          datefin: endDate,
          duree: duration ?? 0,
          etatchef: 0,
          etatrh: 0,
          typeconge: 1,
          certificat: certificatPath,
        },
      };
  
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphqlQuery),
      });
  
      const result = await response.json();
      if (result.errors) {
        console.error('Error creating conge:', result.errors);
        alert('Failed to create congé!');
      } else {
        alert('Demande de congé pour maladie soumise avec succès !');
        router.push('/mesconges');
      }
    } catch (error) {
      console.error('Failed to submit conge:', error);
      alert('An error occurred while submitting your request.');
    }
  };
  

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar */}
      <nav className="w-64 bg-blue-100 border-r shadow-lg min-h-screen">
        <div className="p-4">
          <Image src="/images/oct_logo1.png" alt="Logo OCT" width={180} height={38} priority />
        </div>
        <ul className="p-4 space-y-3">
  {["Dashboard", "Liste des Congés", "Fiche de paie"].map((item) => (
    <li key={item}>
      <button
        onClick={() => handleNavigation(item)}
        className="w-full text-left p-3 font-semibold text-gray-700 rounded-lg hover:bg-[#004571] hover:text-white"
      >
        {item}
      </button>
    </li>
  ))}

  {/* ✅ Show if user has module ID 3 (Validateur RH) */}
{hasModule(3) && (
  <li>
    <button
      onClick={() => router.push("/listecongerh")}
      className="w-full text-left p-3 font-semibold text-gray-700 rounded-lg hover:bg-[#004571] hover:text-white"
    >
      Liste Congés RH
    </button>
  </li>
)}

{/* ✅ Show if user has module ID 5 (Super Admin) */}
{hasModule(3) && (
  <li>
    <button
      onClick={() => router.push("/liste_users")}
      className="w-full text-left p-3 font-semibold text-gray-700 rounded-lg hover:bg-[#004571] hover:text-white"
    >
      Liste users
    </button>
  </li>
)}

{/* ✅ Show if user has module ID 2 (Chef) */}
{hasModule(2) && (
  <li>
    <button
      onClick={() => router.push("/listecongechef")}
      className="w-full text-left p-3 font-semibold text-gray-700 rounded-lg hover:bg-[#004571] hover:text-white"
    >
      Liste Congés Chef
    </button>
  </li>
)}

{/* 🔜 Future feature: Module ID 4 (DMB) */}
{hasModule(4) && (
  <li>
    {/* Future: add navigation to ListeCongesDMB or other */}
  </li>
)}

</ul>

      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex items-center justify-between bg-blue-100 p-4 fixed top-0 left-64 right-0 z-10 shadow-md">
          <h1 className="text-2xl font-bold text-[#004571]">Demande de Congé pour Maladie</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#004571] font-semibold">
              {session?.user?.prenom} {session?.user?.nom}
            </span>
            <Image
              src="/images/logout.png"
              alt="Déconnexion"
              width={30}
              height={30}
              className="cursor-pointer hover:scale-110 transition"
              onClick={handleDisconnect}
            />
            <Image
              src="/images/default_user.png"
              alt="Photo de Profil"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 pt-24">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-8 text-center text-[#004571]">
              Remplissez votre demande de congé pour maladie 🩺
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates */}
              <div>
                <label className="block mb-2 text-[#004571] font-semibold">Date de début :</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-[#004571] font-semibold">Date de fin :</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block mb-2 text-[#004571] font-semibold">Durée (jours) :</label>
                <input
                  type="number"
                  value={duration ?? ''}
                  readOnly
                  className="border border-gray-300 p-2 rounded-md w-full bg-gray-100"
                  placeholder="Durée calculée automatiquement"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block mb-2 text-[#004571] font-semibold">
                  Certificat médical (PDF ou Image) :
                </label>
                <input
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-md w-full"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#004571] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition"
              >
                Soumettre la demande
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
