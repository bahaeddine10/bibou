"use client";

import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Translation {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  leaveType: string;
  dayType: string;
  fullDay: string;
  halfDay: string;
  halfDayChoice: string;
  morning: string;
  afternoon: string;
  certificate: string;
  save: string;
  error: string;
}

interface Translations {
  fr: Translation;
  ar: Translation;
}

export default function DemandecongePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<"fr" | "ar">("fr");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(0);
  const [leaveType, setLeaveType] = useState("full day");
  const [halfDayChoice, setHalfDayChoice] = useState("day");
  const [errorMessage, setErrorMessage] = useState("");
  const [userSolde, setUserSolde] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [typeCongeId, setTypeCongeId] = useState<number>(30);
  const [certificatFile, setCertificatFile] = useState<File | null>(null);

  const typeConges = [
    { id: 1, fr: "conge except", ar: "عطلة إستثنائية" },
    { id: 3, fr: "AT", ar: "حادث شغل" },
    { id: 4, fr: "PRENATALE", ar: "عطلة ولادة" },
    { id: 5, fr: "CM", ar: "عطلة مرضية" },
    { id: 6, fr: "CPN", ar: "عطلة مراقبة" },
    { id: 7, fr: "ALLAITEMENT", ar: "عطلة رضاعة" },
    { id: 8, fr: "MARIAGE", ar: "عطلة زواج" },
    { id: 9, fr: "DECES FAMILLE", ar: "وفاة قريب" },
    { id: 10, fr: "PELERINAGE", ar: "حج" },
    { id: 11, fr: "U.G.T.T.", ar: "رخصة نقابية" },
    { id: 12, fr: "SPORT", ar: "رخصة رياضية" },
    { id: 13, fr: "CAS DE FORCE MAJEURE", ar: "حالة طارئة" },
    { id: 14, fr: "NAISSANCE", ar: "عطلة مولود جديد" },
    { id: 15, fr: "permission culturel", ar: "رخصة ثقافية" },
    { id: 18, fr: "CMLD", ar: "مرض مزمن طويل الأمد" },
    { id: 20, fr: "MI-TEMPS 2/3 SALAIRE", ar: "نظام نصف الوقت مع الإنتفاع بنصف الأجر" },
    { id: 30, fr: "Congé Annuel", ar: "عطلة سنوية" },
    { id: 51, fr: "DS", ar: "عطلة مرخصة مع الإنتفاع بنصف الأجر" },
    { id: 52, fr: "CMLD demi solde", ar: "مرض مزمن طويل الأمد بنصف الأجر" },
    { id: 62, fr: "CMO", ar: "عطلة مرض عادي" },
    { id: 70, fr: "Absence irreg", ar: "غياب غير شرعي" },
    { id: 72, fr: "Congé demi solde", ar: "عطلة بنصف الأجر" },
    { id: 73, fr: "Congé sans solde", ar: "عطلة بدون أجر" },
    { id: 74, fr: "CMLD sans solde", ar: "مرض طويل الأمد بدون أجر" },
    { id: 78, fr: "LD SS", ar: "LD SS" },
    { id: 79, fr: "Mise a Pied", ar: "Mise a Pied" },
    { id: 80, fr: "Congé de maladie refusé", ar: "عطلة مرض مرفوضة" },
    { id: 90, fr: "HSP", ar: "إستشفاء بالمستشفى" },
    { id: 95, fr: "PRORATA", ar: "PRORATA" },
    { id: 96, fr: "Régul, absence", ar: "تسوية غياب" },
  ];

  const translations: Translations = {
    fr: {
      title: "Demande de Congé",
      description: "Veuillez remplir les informations ci-dessous pour votre demande de congé",
      startDate: "Date de début",
      endDate: "Date de fin",
      duration: "Durée (jours)",
      leaveType: "Type de congé",
      dayType: "Type de jour",
      fullDay: "Journée complète",
      halfDay: "Demi-journée",
      halfDayChoice: "Choix demi-journée",
      morning: "Matin",
      afternoon: "Après-midi",
      certificate: "Certificat (si nécessaire)",
      save: "Enregistrer",
      error: "Erreur",
    },
    ar: {
      title: "طلب إجازة",
      description: "يرجى ملء المعلومات أدناه لطلب الإجازة",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      duration: "المدة (أيام)",
      leaveType: "نوع الإجازة",
      dayType: "نوع اليوم",
      fullDay: "يوم كامل",
      halfDay: "نصف يوم",
      halfDayChoice: "اختيار نصف اليوم",
      morning: "صباحاً",
      afternoon: "بعد الظهر",
      certificate: "شهادة (إذا لزم الأمر)",
      save: "حفظ",
      error: "خطأ",
    }
  };

  const solde = userSolde ?? 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0") } 00:00:00`;
  };

  useEffect(() => {
    if (session?.user?.matricule) {
      const fetchSolde = async () => {
        try {
          const response = await fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query {
                SoldeConge(idt_matag: "${session.user.matricule}") {
                  solde
                }
              }`
            }),
          });
          const result = await response.json();
          setUserSolde(result.data?.SoldeConge?.solde ?? 0);
        } catch (error) {
          console.error("Failed to fetch solde:", error);
          setUserSolde(null);
        }
      };
      fetchSolde();
    }
  }, [session]);

  const calculateDuration = useCallback(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      let difference = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
      difference = difference >= 0 ? difference : 0;
      if (leaveType === "half day") difference = difference / 2;
      setDuration(difference);
    } else {
      setDuration(0);
    }
  }, [startDate, endDate, leaveType]);

  useEffect(() => {
    calculateDuration();
  }, [startDate, endDate, leaveType, calculateDuration]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setErrorMessage("Start date cannot be after end date.");
      } else if (duration > solde) {
        setErrorMessage("Duration exceeds your available solde.");
      } else {
        setErrorMessage("");
      }
    } else {
      setErrorMessage("");
    }
  }, [startDate, endDate, duration, solde]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData();

    const operations = JSON.stringify({
      query: `
        mutation ($certificat: Upload) {
          createConge(
            nom: "${session.user.nom}",
            prenom: "${session.user.prenom}",
            matricule: "${session.user.matricule}",
            datedebut: "${formatDate(startDate)}",
            datefin: "${formatDate(endDate)}",
            datedebutchef: "${formatDate(startDate)}",
            datefinchef: "${formatDate(endDate)}",
            duree: ${duration.toFixed(1)},
            etatchef: 0,
            etatrh: 0,
            typeconge: ${typeCongeId},
            typecongear: ${typeCongeId},
            certificat: $certificat
          ) {
            id
            nom
            prenom
            matricule
            certificat
          }
        }
      `,
      variables: { certificat: null }
    });

    const map = JSON.stringify({ "0": ["variables.certificat"] });

    formData.append("operations", operations);
    formData.append("map", map);
    if (certificatFile) formData.append("0", certificatFile);

    try {
      const res = await fetch("http://localhost:8000/graphql", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.errors) {
        setErrorDetails(`Error: ${JSON.stringify(result.errors)}`);
      } else {
        setErrorDetails(null);
        alert("Demande de congé envoyée avec succès !");
        router.push("/mesconges");
      }
    } catch (error) {
      setErrorDetails(`Erreur: ${String(error)}`);
    }
  };

  return (
    <Layout title={translations[language].title}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
              className="px-4 py-2 text-sm font-medium text-[#004571] hover:bg-gray-100 rounded-lg transition-colors"
            >
              {language === "fr" ? "العربية" : "Français"}
            </button>
          </div>

          <div className={`mb-6 ${language === "ar" ? "text-right" : ""}`}>
            <h2 className={`text-2xl font-bold text-[#004571] mb-2 ${language === "ar" ? "font-arabic" : ""}`}>
              {translations[language].title}
            </h2>
            <p className={`text-sm text-gray-600 ${language === "ar" ? "font-arabic" : ""}`}>
              {translations[language].description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                  {translations[language].startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors"
                  required
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>

              <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                  {translations[language].endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors"
                  required
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                  {translations[language].duration}
                </label>
                <input
                  type="text"
                  value={duration}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>

              <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                  {translations[language].leaveType}
                </label>
                <select
                  value={typeCongeId}
                  onChange={(e) => setTypeCongeId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors"
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  {typeConges.map((type) => (
                    <option key={type.id} value={type.id}>
                      {language === "ar" ? type.ar : type.fr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                  {translations[language].dayType}
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors"
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <option value="full day">{translations[language].fullDay}</option>
                  <option value="half day">{translations[language].halfDay}</option>
                </select>
              </div>

              {leaveType === "half day" && (
                <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
                  <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                    {translations[language].halfDayChoice}
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center space-x-2 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <input
                        type="radio"
                        value="day"
                        checked={halfDayChoice === "day"}
                        onChange={(e) => setHalfDayChoice(e.target.value)}
                        className="text-[#004571] focus:ring-[#004571]"
                      />
                      <span className={`text-sm ${language === "ar" ? "font-arabic" : ""}`}>
                        {translations[language].morning}
                      </span>
                    </label>
                    <label className={`flex items-center space-x-2 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <input
                        type="radio"
                        value="night"
                        checked={halfDayChoice === "night"}
                        onChange={(e) => setHalfDayChoice(e.target.value)}
                        className="text-[#004571] focus:ring-[#004571]"
                      />
                      <span className={`text-sm ${language === "ar" ? "font-arabic" : ""}`}>
                        {translations[language].afternoon}
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className={`space-y-2 ${language === "ar" ? "text-right" : ""}`}>
              <label className={`block text-sm font-medium text-gray-700 ${language === "ar" ? "font-arabic" : ""}`}>
                {translations[language].certificate}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) setCertificatFile(e.target.files[0]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004571] focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#004571] file:text-white hover:file:bg-[#003a5e]"
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>

            {errorMessage && (
              <div className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm ${language === "ar" ? "text-right font-arabic" : ""}`}>
                {errorMessage}
              </div>
            )}

            {errorDetails && (
              <div className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm ${language === "ar" ? "text-right font-arabic" : ""}`}>
                {errorDetails}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!!errorMessage}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                  errorMessage 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#004571] hover:bg-[#003a5e]"
                } ${language === "ar" ? "font-arabic" : ""}`}
              >
                {translations[language].save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}