"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

// Types

type Child = {
  ENF_PRN: string;
  ENF_PRNAR: string;
  ENF_DATNAIS: string;
};

type Conjoint = {
  CON_NOM: string;
  CON_PRN: string;
  CON_NOMAR: string;
  CON_PRNAR: string;
  CON_DATNAIS: string;
};

type Identity = {
  IDT_MATAG: string;
  NOM: string;
  NOMAR: string;
  PRENOM: string;
  PRENOMAR: string;
  CIN: string;
  ADHERENT: string;
  ADRESSE: string;
  DATE_NAISSANCE: string;
  DATE_RECRUTEMENT: string;
  DATE_TITULARISATION: string;
  DATE_FONCTION: string;
  POSITION: string;
  DATE_POSITION: string;
  DATE_SOUS_POSITION: string;
  SOUS_POSITION: string;
  BANQUE: string;
  RIB: string;
  CATEGORIE: string;
  ECHELLE: string;
  ECHELON: string;
  DATE_ECHELON: string;
  DATE_CATEGORIE: string;
  CLASSE: string;
  DATE_CLASSE: string;
  SEXE: string;
  NOMBRE_ENFANTS: number;
  IDENTIFIANT_UNIQUE: string;
  EMPLOI: string;
  FONCTION: string;
  AFFECTATION: string;
  REGIME: string;
  CONJOINT: Conjoint;
  ENFANTS_LISTE: Child[];
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [userSolde, setUserSolde] = useState<number | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };
 // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/graphql";
console.log("Using API session:", session);
  useEffect(() => {
   

    const fetchData = async () => {
      
      if (!session?.user?.matricule) return;
      try {
        const res = await fetch("http://localhost:8000/graphql" , {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              ficheIdentite(idt_matag: "${session.user.matricule}") {
                IDT_MATAG NOM NOMAR PRENOM PRENOMAR CIN ADHERENT ADRESSE DATE_NAISSANCE
                DATE_RECRUTEMENT DATE_TITULARISATION DATE_FONCTION
                POSITION DATE_POSITION DATE_SOUS_POSITION SOUS_POSITION
                BANQUE RIB CATEGORIE DATE_CATEGORIE ECHELLE ECHELON DATE_ECHELON
                CLASSE DATE_CLASSE SEXE NOMBRE_ENFANTS IDENTIFIANT_UNIQUE EMPLOI
                FONCTION AFFECTATION REGIME
                CONJOINT { CON_NOM CON_PRN CON_NOMAR CON_PRNAR CON_DATNAIS }
                ENFANTS_LISTE { ENF_PRN ENF_PRNAR ENF_DATNAIS }
              }
            }`,
          }),
        });
        const result = await res.json();
        setIdentity(result.data?.ficheIdentite ?? null);
      } catch (err) {
        console.error("Erreur de récupération:", err);
      }
    };

    const fetchSolde = async () => {
      if (!session?.user?.matricule) return;
      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query { SoldeConge(idt_matag: "${session.user.matricule}") { solde } }`,
          }),
        });
        const result = await res.json();
        setUserSolde(result.data?.SoldeConge?.solde ?? null);
      } catch (err) {
        console.error("Erreur de récupération du solde:", err);
      }
    };

    fetchData();
    fetchSolde();
  }, [session]);

  return (
    <Layout title="Tableau de Bord">
      {identity && (
        <>
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-bold mb-4 text-[#004571] flex items-center gap-2">
                <span className="text-xl">👤</span>
                Informations Générales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-700">
                <div><strong>Nom :</strong> {identity.NOM} ({identity.NOMAR})</div>
                <div><strong>Prénom :</strong> {identity.PRENOM} ({identity.PRENOMAR})</div>
                {/*<div><strong>Sexe :</strong> {identity.SEXE}</div>*/}
                <div><strong>Date de Naissance :</strong> {formatDateFr(identity.DATE_NAISSANCE)}</div>
                <div><strong>CIN :</strong> {identity.CIN}</div>
                <div><strong>Code Social :</strong> {identity.ADHERENT}</div>
                <div><strong>Adresse :</strong> {identity.ADRESSE}</div>
                <div><strong>Matricule :</strong> {identity.IDT_MATAG}</div>
                <div><strong>Banque :</strong> {identity.BANQUE}</div>
                <div><strong>RIB :</strong> {identity.RIB}</div>
                <div><strong>Département :</strong> {identity.AFFECTATION}</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-bold mb-4 text-[#004571] flex items-center gap-2">
                <span className="text-xl">💼</span>
                Carrière & Statut
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-700">
                <div><strong>Emploi :</strong> {identity.EMPLOI}</div>
                <div><strong>Fonction :</strong> {identity.FONCTION} ({formatDateFr(identity.DATE_FONCTION)})</div>
                <div><strong>Catégorie :</strong> {identity.CATEGORIE} ({formatDateFr(identity.DATE_CATEGORIE)})</div>
                <div><strong>Échelle :</strong> {identity.ECHELLE}</div>
                <div><strong>Échelon :</strong> {identity.ECHELON} ({formatDateFr(identity.DATE_ECHELON)})</div>
                <div><strong>Classe :</strong> {identity.CLASSE} ({formatDateFr(identity.DATE_CLASSE)})</div>
                <div><strong>Position :</strong> {identity.POSITION} ({formatDateFr(identity.DATE_POSITION)})</div>
                <div><strong>Sous-Position :</strong> {identity.SOUS_POSITION} {identity.DATE_SOUS_POSITION && `(${formatDateFr(identity.DATE_SOUS_POSITION)})`}</div>
                <div><strong>Date Recrutement :</strong> {formatDateFr(identity.DATE_RECRUTEMENT)}</div>
                <div><strong>Date Titularisation :</strong> {formatDateFr(identity.DATE_TITULARISATION)}</div>
                <div><strong>Régime :</strong> {identity.REGIME}</div>
                <div><strong>Identifiant Unique :</strong> {identity.IDENTIFIANT_UNIQUE}</div>
              </div>
            </div>

            {identity.CONJOINT && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
                  <h3 className="text-lg font-bold mb-4 text-[#004571] flex items-center gap-2">
                    <span className="text-xl">💑</span>
                    Conjoint
                  </h3>
                  <div className="grid gap-3 sm:gap-4 text-sm text-gray-700">
                    <div><strong>Nom :</strong> {identity.CONJOINT.CON_NOM} ({identity.CONJOINT.CON_NOMAR})</div>
                    <div><strong>Prénom :</strong> {identity.CONJOINT.CON_PRN} ({identity.CONJOINT.CON_PRNAR})</div>
                    <div><strong>Date de Naissance :</strong> {formatDateFr(identity.CONJOINT.CON_DATNAIS)}</div>
                  </div>
                </div>

                {identity.ENFANTS_LISTE?.length > 0 && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md">
                    <h3 className="text-lg font-bold mb-4 text-[#004571] flex items-center gap-2">
                      <span className="text-xl">👨‍👩‍👧‍👦</span>
                      Enfants
                    </h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {identity.ENFANTS_LISTE.map((child, idx) => (
                        <li key={idx}>
                          {child.ENF_PRN} ({child.ENF_PRNAR}) — Né le {formatDateFr(child.ENF_DATNAIS)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md text-center">
              <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2">
                <span className="text-xl">📅</span>
                Solde de Congés
              </h3>
              <p className="text-3xl sm:text-4xl font-bold text-green-700">
                {userSolde !== null ? `${userSolde} jours` : "Chargement..."}
              </p>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}