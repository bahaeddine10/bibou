"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Identity = {
  IDT_MATAG: string;
  NOM: string;
  PRENOM: string;
  FONCTION: string;
  AFFECTATION: string;
};

type UserMinimal = {
  matricule: string;
  nom: string;
  prenom: string;
};

export default function DemandemissionPage() {
  const { data: session } = useSession();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccompagnants, setSelectedAccompagnants] = useState<string[]>([]);
  const router = useRouter();

  const wilayas: string[] = [
    "تونس", "أريانة", "بن عروس", "منوبة", "نابل", "زغوان", "بنزرت", "باجة",
    "جندوبة", "الكاف", "سليانة", "القيروان", "القصرين", "سيدي بوزيد", "سوسة",
    "المنستير", "المهدية", "صفاقس", "قفصة", "توزر", "قبلي", "قابس", "مدنين", "تطاوين"
  ];

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string[]>([]);
  const [residence, setResidence] = useState<string[]>([]);
  const [missionSubject, setMissionSubject] = useState<string>("");

  useEffect(() => {
    const fetchIdentity = async () => {
      if (!session?.user?.matricule) return;
      try {
        const res = await fetch("http://localhost:8000/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query {
              ficheIdentite(idt_matag: "${session.user.matricule}") {
                IDT_MATAG
                NOM
                PRENOM
                FONCTION
                AFFECTATION
              }
            }`,
          }),
        });
        const result = await res.json();
        setIdentity(result.data?.ficheIdentite ?? null);
      } catch (err) {
        console.error("❌ Erreur de récupération de ficheIdentite:", err);
      }
    };

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

    fetchIdentity();
    fetchUsers();
  }, [session]);

  const handleAccompagnantToggle = (fullName: string) => {
    setSelectedAccompagnants((prev) =>
      prev.includes(fullName)
        ? prev.filter((name) => name !== fullName)
        : [...prev, fullName]
    );
  };

  const handleSubmit = async () => {
    if (!identity) return;

    const variables = {
      datedebut: startDate + " 00:00:00",
      datefin: endDate + " 00:00:00",
      fromlocation: from,
      tolocation: to.join(", "),
      sujet: missionSubject,
      nom: `${identity.NOM} ${identity.PRENOM}`,
      residence: residence.join(", "),
      matricule: identity.IDT_MATAG,
      fonction: identity.FONCTION,
      department: identity.AFFECTATION,
      accompagnant: selectedAccompagnants.join(", "),
    };

    const query = `
      mutation CreateMission(
        $datedebut: DateTime!
        $datefin: DateTime!
        $fromlocation: String!
        $tolocation: String!
        $sujet: String!
        $residence: String!
        $nom: String
        $matricule: String
        $fonction: String
        $department: String
        $accompagnant: String
      ) {
        createMission(
          datedebut: $datedebut
          datefin: $datefin
          fromlocation: $fromlocation
          tolocation: $tolocation
          sujet: $sujet
          residence: $residence
          nom: $nom
          matricule: $matricule
          fonction: $fonction
          department: $department
          accompagnant: $accompagnant
        ) {
          id
          sujet
          datedebut
        }
      }
    `;

    try {
      const response = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const result = await response.json();
      if (result.data?.createMission?.id) {
        alert("✅ تم إرسال المأمورية بنجاح");
        router.push("/mes_demandes_mission");
      } else {
        alert("❌ حدث خطأ أثناء إرسال المأمورية");
      }
    } catch (error) {
      console.error("❌ Error submitting mission:", error);
      alert("❌ حدث خطأ أثناء إرسال المأمورية");
    }
  };

  const filteredUsers = users.filter((user) =>
    `${user.prenom} ${user.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="📝 مطلب إذن بالمأمورية">
      <div className="p-6 pt-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 text-right font-[cairo] leading-loose">
          <h2 className="text-xl font-bold mb-4">📝 مطلب إذن بالمأمورية</h2>

          <div className="grid gap-4 mb-6">
          <div>
              <label className="block mb-1">تاريخ الانطلاق</label>
              <input type="date" className="w-full border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <label className="block mb-1">تاريخ الرجوع</label>
              <input type="date" className="w-full border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div>
              <label className="block mb-1">الإقامة</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={residence.join(", ")}
                onChange={(e) => setResidence(e.target.value.split(",").map((w) => w.trim()))}
                placeholder="مثال: فندق المرادي، إقامة الجامعة"
              />
            </div>

            <div>
              <label className="block mb-1">من</label>
              <select className="w-full h-12 text-lg border p-2 rounded" value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">اختر الولاية</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">إلى</label>
              <select className="w-full h-12 text-lg border p-2 rounded" value={to[0] || ""} onChange={(e) => setTo([e.target.value])}>
                <option value="">اختر الولاية</option>
                {wilayas.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">موضوع المأمورية</label>
              <textarea className="w-full border p-2 rounded" rows={3} value={missionSubject} onChange={(e) => setMissionSubject(e.target.value)} placeholder="مثال: متابعة ملفات الموارد البشرية..." />
            </div>
          </div>


          <div className="text-left mt-6">

          </div>
            <div>
              <label className="block mb-1">الأشخاص المرافقين</label>
              <input
                type="text"
                placeholder="🔍 البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mb-2 border p-2 rounded"
              />
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {filteredUsers.map((user) => {
                  const fullName = `${user.prenom} ${user.nom}`;
                  return (
                    <label key={user.matricule} className="block cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAccompagnants.includes(fullName)}
                        onChange={() => handleAccompagnantToggle(fullName)}
                        className="mr-2"
                      />
                      {fullName}
                    </label>
                  );
                })}
              </div>
              {selectedAccompagnants.length > 0 && (
  <div className="mt-4 p-2 border rounded bg-gray-50">
    <p className="font-semibold mb-2">المرافقون المختارون:</p>
    <ul className="list-disc pl-5">
      {selectedAccompagnants.map((name, index) => (
        <li key={index}>{name}</li>
      ))}
    </ul>
  </div>
)}

            </div>
          </div>

          <div className="text-left mt-6">
            <button onClick={handleSubmit} disabled={!identity} className={`bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${!identity ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}>
              📤 إرسال
            </button>
          </div>
        </div>
    </Layout>
  );
}
