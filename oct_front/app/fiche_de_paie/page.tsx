"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

type SalaireItem = {
  ind_code: number;
  ind_dsg: string;
  mvp_mnt: number;
  sens: number;
};

type Child = {
  ENF_PRN: string;
  ENF_RANG: string;
  CON_RANG: string;
  CON_NOM: string;
  CON_PRN: string;
};

type Identity = {
  IDT_MATAG: string;
  NOM: string;
  PRENOM: string;
  POSITION: string;
  BANQUE: string;
  RIB: string;
  CATEGORIE: string;
  ECHELLE: string;
  ECHELON: string;
  DATE_ECHELON: string;
  DATE_CATEGORIE: string;
  DATE_POSITION: string;
  CLASSE: string;
  DATE_CLASSE: string;
  SEXE: string;
  NOMBRE_ENFANTS: number;
  ENFANTS_LISTE: Child[];
  IDENTIFIANT_UNIQUE: string;
  EMPLOI: string;
  FONCTION: string;
  AFFECTATION: string;
};

type SalaireData = {
  gains_fixe: SalaireItem[];
  gains_variable: SalaireItem[];
  retenues_fixe: SalaireItem[];
  retenues_variable: SalaireItem[];
  salaire_de_base: SalaireItem | null;
  prc: SalaireItem | null;
  salaire_brut: number;
  net_a_payer: number;
};

const moisOptions = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  "13ème Mois", "1ère Prime", "2ème Prime", "3ème Prime", "4ème Prime", "Productivité"
];

const moisToNumber = (mois: string) => moisOptions.indexOf(mois) + 1;

export default function FicheDePaiePage() {
  const { data: session } = useSession();
  const [mois, setMois] = useState("Janvier");
  const [annee, setAnnee] = useState(new Date().getFullYear().toString());
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [salaire, setSalaire] = useState<SalaireData | null>(null);

  const formatDateFr = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const handleFetchData = async () => {
    if (!session?.user?.matricule) return;
    const mat = session.user.matricule;
    const monthNum = moisToNumber(mois);
    const yearNum = parseInt(annee);

    const resIdentity = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($idt_matag: String!) {
          ficheIdentite(idt_matag: $idt_matag) {
            IDT_MATAG NOM PRENOM POSITION BANQUE RIB CATEGORIE ECHELLE ECHELON
            DATE_ECHELON DATE_CATEGORIE DATE_POSITION CLASSE DATE_CLASSE SEXE
            NOMBRE_ENFANTS ENFANTS_LISTE { ENF_PRN ENF_RANG CON_RANG CON_NOM CON_PRN }
            IDENTIFIANT_UNIQUE EMPLOI FONCTION AFFECTATION
          }
        }`,
        variables: { idt_matag: mat }
      }),
    }).then(res => res.json());

    const resSalaire = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($idt_matag: String!, $mois: Int!, $annee: Int!) {
          ficheSalaire(idt_matag: $idt_matag, mois: $mois, annee: $annee) {
            gains_fixe { ind_code ind_dsg mvp_mnt sens }
            gains_variable { ind_code ind_dsg mvp_mnt sens }
            retenues_fixe { ind_code ind_dsg mvp_mnt sens }
            retenues_variable { ind_code ind_dsg mvp_mnt sens }
            salaire_de_base { ind_code ind_dsg mvp_mnt sens }
            prc { ind_code ind_dsg mvp_mnt sens }
            salaire_brut net_a_payer
          }
        }`,
        variables: { idt_matag: mat, mois: monthNum, annee: yearNum }
      }),
    }).then(res => res.json());

    setIdentity(resIdentity.data?.ficheIdentite || null);
    setSalaire(resSalaire.data?.ficheSalaire || null);
  };

  const handleDownloadPDF = () => {
    if (!identity || !salaire) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("OFFICE DU COMMERCE", 15, 10);
    doc.text("DE LA TUNISIE", 15, 16);
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0);
    doc.text("Bulletin de paie", 15, 30);
    doc.setTextColor(0, 0, 255);
    doc.text(`Mois : ${mois}.${annee}`, 150, 30);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 40,
      head: [["Mat.", "Nom & Prénom", "Affectation"]],
      body: [[identity.IDT_MATAG, `${identity.NOM} ${identity.PRENOM}`, identity.AFFECTATION]],
      theme: "grid"
    });

    autoTable(doc, {
      startY: doc.lastAutoTable!.finalY + 2,
      head: [["Catégorie", "Echel.", "Echel. Date", "Classe", "Classe Date", "Position", "S.F", "Enfants", "IU"]],
      body: [[
        identity.CATEGORIE, identity.ECHELLE, formatDateFr(identity.DATE_ECHELON),
        identity.CLASSE, formatDateFr(identity.DATE_CLASSE), identity.POSITION,
        identity.SEXE, identity.NOMBRE_ENFANTS, identity.IDENTIFIANT_UNIQUE
      ]],
      theme: "grid"
    });

    autoTable(doc, {
      startY: doc.lastAutoTable!.finalY + 2,
      head: [["Emploi", identity.EMPLOI]],
      body: [],
      theme: "grid"
    });

    autoTable(doc, {
      startY: doc.lastAutoTable!.finalY + 2,
      head: [["RIB", identity.RIB]],
      body: [],
      theme: "grid"
    });

    const rows: string[][] = [];
    const allGains = [...salaire.gains_fixe, ...salaire.gains_variable];
    const allRetenues = [...salaire.retenues_fixe, ...salaire.retenues_variable];
    const maxLength = Math.max(allGains.length, allRetenues.length);

    for (let i = 0; i < maxLength; i++) {
      let gainName = "";
      let gainFixeValue = "";
      let gainVariableValue = "";

      if (allGains[i]) {
        gainName = allGains[i].ind_dsg;
        if (salaire.gains_fixe.find(g => g.ind_dsg === allGains[i].ind_dsg)) {
          gainFixeValue = allGains[i].mvp_mnt.toFixed(3);
        } else if (salaire.gains_variable.find(g => g.ind_dsg === allGains[i].ind_dsg)) {
          gainVariableValue = allGains[i].mvp_mnt.toFixed(3);
        }
      }

      let retenueName = "";
      let retenueFixeValue = "";
      let retenueVariableValue = "";

      if (allRetenues[i]) {
        retenueName = allRetenues[i].ind_dsg;
        if (salaire.retenues_fixe.find(r => r.ind_dsg === allRetenues[i].ind_dsg)) {
          retenueFixeValue = allRetenues[i].mvp_mnt.toFixed(3);
        } else if (salaire.retenues_variable.find(r => r.ind_dsg === allRetenues[i].ind_dsg)) {
          retenueVariableValue = allRetenues[i].mvp_mnt.toFixed(3);
        }
      }

      rows.push([
        gainName, gainFixeValue, gainVariableValue,
        retenueName, retenueFixeValue, retenueVariableValue
      ]);
    }

    autoTable(doc, {
      startY: doc.lastAutoTable!.finalY + 10,
      head: [["GAINS", "Fixe", "Variable", "RETENUES", "Fixe", "Variable"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [26, 188, 156], textColor: 255, halign: "center" },
      styles: { halign: "center", fontSize: 8 }
    });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 255);
    doc.text(`Salaire Brut : ${salaire.salaire_brut.toFixed(3)} TND`, 15, doc.lastAutoTable!.finalY + 10);
    doc.setTextColor(255, 0, 0);
    doc.text(`Net à Payer : ${salaire.net_a_payer.toFixed(3)} TND`, 150, doc.lastAutoTable!.finalY + 10);

    doc.save("fiche_de_paie.pdf");
  };

  return (
    <Layout title="Fiche de paie">
      <div className="p-6 pt-28 text-black">
        <div className="flex gap-4 mb-6 text-black">
          <select value={mois} onChange={(e) => setMois(e.target.value)} className="border p-2 text-black">
            {moisOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={annee} onChange={(e) => setAnnee(e.target.value)} className="border p-2 text-black">
            {Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i)).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={handleFetchData} className="bg-blue-600 text-white px-6 py-2 rounded">Afficher</button>
        </div>

        {identity && salaire && (
          <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 text-center text-black">
                <thead className="bg-teal-500 text-white font-bold">
                  <tr>
                    <th className="p-2 border">GAINS</th>
                    <th className="p-2 border">Fixe</th>
                    <th className="p-2 border">Variable</th>
                    <th className="p-2 border">RETENUES</th>
                    <th className="p-2 border">Fixe</th>
                    <th className="p-2 border">Variable</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-black">
                  {(() => {
                    const rows = [];
                    const allGains = [...salaire.gains_fixe, ...salaire.gains_variable];
                    const allRetenues = [...salaire.retenues_fixe, ...salaire.retenues_variable];
                    const maxLength = Math.max(allGains.length, allRetenues.length);

                    for (let i = 0; i < maxLength; i++) {
                      let gainName = '';
                      let gainFixeValue = '';
                      let gainVariableValue = '';

                      if (allGains[i]) {
                        gainName = allGains[i].ind_dsg;
                        if (salaire.gains_fixe.find(g => g.ind_dsg === allGains[i].ind_dsg)) {
                          gainFixeValue = allGains[i].mvp_mnt.toFixed(3);
                        } else if (salaire.gains_variable.find(g => g.ind_dsg === allGains[i].ind_dsg)) {
                          gainVariableValue = allGains[i].mvp_mnt.toFixed(3);
                        }
                      }

                      let retenueName = '';
                      let retenueFixeValue = '';
                      let retenueVariableValue = '';

                      if (allRetenues[i]) {
                        retenueName = allRetenues[i].ind_dsg;
                        if (salaire.retenues_fixe.find(r => r.ind_dsg === allRetenues[i].ind_dsg)) {
                          retenueFixeValue = allRetenues[i].mvp_mnt.toFixed(3);
                        } else if (salaire.retenues_variable.find(r => r.ind_dsg === allRetenues[i].ind_dsg)) {
                          retenueVariableValue = allRetenues[i].mvp_mnt.toFixed(3);
                        }
                      }

                      rows.push(
                        <tr key={i}>
                          <td className="p-2 border">{gainName}</td>
                          <td className="p-2 border">{gainFixeValue}</td>
                          <td className="p-2 border">{gainVariableValue}</td>
                          <td className="p-2 border">{retenueName}</td>
                          <td className="p-2 border">{retenueFixeValue}</td>
                          <td className="p-2 border">{retenueVariableValue}</td>
                        </tr>
                      );
                    }
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <div className="text-lg font-bold">Salaire Brut : {salaire.salaire_brut.toFixed(3)} TND</div>
              <div className="text-lg font-bold">Net à Payer : {salaire.net_a_payer.toFixed(3)} TND</div>
            </div>
            <button onClick={handleDownloadPDF} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Télécharger PDF
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}