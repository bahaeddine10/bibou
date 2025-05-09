"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useCallback } from "react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const translations = {
  ar: {
    alerts: {
      chef: {
        title: "تنبيه للمدير",
        message: "لديك طلبات تحتاج إلى مراجعة",
        button: "عرض الطلبات"
      },
      rh: {
        title: "تنبيه لموارد بشرية",
        message: "لديك طلبات تحتاج إلى معالجة",
        button: "عرض الطلبات"
      }
    }
  },
  fr: {
    alerts: {
      chef: {
        title: "Alerte Chef",
        message: "Vous avez des demandes à examiner",
        button: "Voir les demandes"
      },
      rh: {
        title: "Alerte RH",
        message: "Vous avez des demandes à traiter",
        button: "Voir les demandes"
      }
    }
  }
};

export default function Layout({ children, title }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [lang] = useState<'ar' | 'fr'>('ar');
  const t = translations[lang];
  const [alerts, setAlerts] = useState<{
    chef: boolean;
    rh: boolean;
  }>({ chef: false, rh: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const hasModule = useCallback((moduleId: number): boolean => {
    return session?.user?.modules?.some((m) => m.id === moduleId) ?? false;
  }, [session?.user?.modules]);

  const handleNavigation = (item: string) => {
    const paths: Record<string, string> = {
      "Dashboard": "/dashboard",
      "Liste des Congés": "/mesconges",
      "Fiche de paie": "/fiche_de_paie",
      "Congé Maladie": "/conge_maladie",
      "Liste des Arrêts/Reprises": "/mes_arrets_reprises",
      "Mes Demandes Voiture": "/mes_demandes_voiture",
      "Mes Demandes Mission": "/mes_demandes_mission",
      "Mes Demandes Generale": "/mes_demandes_generales",

    };

    router.push(paths[item] || "/");
  };

  const handleDisconnect = () => {
    localStorage.clear();
    signOut({ callbackUrl: "/" });
  };

  // 🔐 Access Control
  useEffect(() => {
    if (!session?.user) return;

    const path = window.location.pathname;

    const accessRules: Record<string, () => boolean> = {
      "/dashboard": () => hasModule(1),
      "/mesconges": () => hasModule(1),
      "/mes_demandes_generales": () => hasModule(1),
      "/demande_generale": () => hasModule(1),
      "/mes_demandes_voiture": () => hasModule(1),
      "/mes_demandes_mission": () => hasModule(1),
      "/mes_arrets_reprises": () => hasModule(1),
      "/demande_arret_reprise": () => hasModule(1),
      "/fiche_de_paie": () => hasModule(1),
      "/conge_maladie": () => hasModule(1),
      "/listecongechef": () => hasModule(2),
      "/listecongerh": () => hasModule(3),
      "/liste_mission_rh": () => hasModule(3),
      "/liste_demandes_voiture_chef": () => hasModule(2),
      "/liste_users": () => session.user.isSuperAdmin === true,
      "/liste_demandes_voiture_dmb": () => hasModule(4),
      "/liste_voitures": () => hasModule(4),
      "/create_voiture": () => hasModule(4),
      "/update_voiture": () => hasModule(4),
      "/liste_mission_dmb": () => hasModule(4),
      "/liste_demandes_generales": () => hasModule(4),




    };

    const hasAccess = accessRules[path];

    if (hasAccess && !hasAccess()) {
      alert("⛔ Accès refusé.");
      localStorage.clear();
      router.push("/");
    }
  }, [session, router, hasModule]);

  useEffect(() => {
    const checkPendingRequests = async () => {
      if (!session?.user?.matricule) return;

      try {
        // Vérifier les demandes en attente pour le chef
        if (hasModule(2)) {
          const resChef = await fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query {
                congesByDepartment(departmentId: "${session.user.departmentId}") {
                  etatchef
                }
              }`,
            }),
          });
          const resultChef = await resChef.json();
          const pendingChefRequests = resultChef?.data?.congesByDepartment?.filter(
            (conge: { etatchef: number }) => conge.etatchef === 0
          ).length || 0;
          setAlerts(prev => ({ ...prev, chef: pendingChefRequests > 0 }));
        }

        // Vérifier les demandes en attente pour les RH
        if (hasModule(3)) {
          const resRH = await fetch("http://localhost:8000/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `query {
                congesByDepartment(departmentId: "${session.user.departmentId}") {
                  etatrh
                }
              }`,
            }),
          });
          const resultRH = await resRH.json();
          const pendingRHRequests = resultRH?.data?.congesByDepartment?.filter(
            (conge: { etatrh: number }) => conge.etatrh === 0
          ).length || 0;
          setAlerts(prev => ({ ...prev, rh: pendingRHRequests > 0 }));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des demandes:", error);
      }
    };

    checkPendingRequests();
    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkPendingRequests, 300000);
    return () => clearInterval(interval);
  }, [session, hasModule]);

  useEffect(() => {
    const count = (alerts.chef ? 1 : 0) + (alerts.rh ? 1 : 0);
    setNotificationCount(count);
  }, [alerts.chef, alerts.rh]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e6edf2]">
      {/* Sidebar */}
      <nav className="w-56 bg-[#f8fafc] border-r border-gray-200 min-h-screen fixed left-0 top-0 z-20 overflow-y-auto max-h-screen">
        <div className="p-4 border-b border-gray-200">
          <Image src="/images/oct_logo1.png" alt="Logo OCT" width={140} height={30} priority />
        </div>

        <div className="p-4">
          <ul className="space-y-1">
            {hasModule(1) &&
              ["Dashboard", "Liste des Congés", "Fiche de paie", "Liste des Arrêts/Reprises", "Mes Demandes Voiture" , "Mes Demandes Mission", "Mes Demandes Generale"].map((item) => {
                const path =
                  item === "Dashboard" ? "/dashboard" :
                    item === "Liste des Congés" ? "/mesconges" :
                      item === "Fiche de paie" ? "/fiche_de_paie" :
                        item === "Liste des Arrêts/Reprises" ? "/mes_arrets_reprises" :
                        item === "Mes Demandes Mission" ? "/mes_demandes_mission" :
                        item === "Mes Demandes Generale" ? "/mes_demandes_generales" :
                          item === "Mes Demandes Voiture" ? "/mes_demandes_voiture" : "";


                return (
                  <li key={item}>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive(path)
                        ? "bg-[#004571] text-white"
                        : "text-gray-600 hover:bg-[#004571] hover:text-white"
                        }`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-sm">
                        {item === "Dashboard" && "📊"}
                        {item === "Liste des Congés" && "📅"}
                        {item === "Fiche de paie" && "💰"}
                        {item === "Liste des Arrêts/Reprises" && "🛑"}
                        {item === "Mes Demandes Voiture" && "🚗"}
                        {item === "Mes Demandes Mission" && "✈️"}
                        {item === "Mes Demandes Generale" && "📝"}



                      </span>

                      {item}
                    </button>
                  </li>
                );
              })}

            {hasModule(3) && (
              <>
                <li>
                  <button
                    onClick={() => router.push("/listecongerh")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/listecongerh")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">👥</span>
                    Congés RH
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/liste_mission_rh")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_mission_rh")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">🛫</span>
                    Missions RH
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/liste_demandes_generales")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_demandes_generales")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">🗃️</span>
                    Demandes Generales RH
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/liste_arret_reprise_rh")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_arret_reprise_rh")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">📋</span>
                    Arrêts/Reprise RH
                  </button>
                </li>
              </>
            )}

            {hasModule(2) && (
              <>
                <li>
                  <button
                    onClick={() => router.push("/listecongechef")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/listecongechef")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">👨‍💼</span>
                    Congés Chef
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/liste_demandes_voiture_chef")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_demandes_voiture_chef")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">🚘</span>
                    Voiture service (Chef)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/liste_arret_reprise_chef")}
                    className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_arret_reprise_chef")
                      ? "bg-[#004571] text-white"
                      : "text-gray-600 hover:bg-[#004571] hover:text-white"
                      }`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-sm">🧾</span>
                    Arrêts/Reprise Chef
                  </button>
                </li>
              </>
            )}

{hasModule(4) && (
  <>
    <li>
      <button
        onClick={() => router.push("/liste_mission_dmb")}
        className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
          isActive("/liste_mission_dmb")
            ? "bg-[#004571] text-white"
            : "text-gray-600 hover:bg-[#004571] hover:text-white"
        }`}
      >
        <span className="w-5 h-5 flex items-center justify-center text-sm">🛬</span>
        Missions DMB
      </button>
    </li>

    <li>
      <button
        onClick={() => router.push("/liste_demandes_voiture_dmb")}
        className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
          isActive("/liste_demandes_voiture_dmb")
            ? "bg-[#004571] text-white"
            : "text-gray-600 hover:bg-[#004571] hover:text-white"
        }`}
      >
        <span className="w-5 h-5 flex items-center justify-center text-sm">🚐</span>
        Voiture de service (DMB)
      </button>
    </li>

    <li>
      <button
        onClick={() => router.push("/liste_voitures")}
        className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
          isActive("/liste_voitures")
            ? "bg-[#004571] text-white"
            : "text-gray-600 hover:bg-[#004571] hover:text-white"
        }`}
      >
        <span className="w-5 h-5 flex items-center justify-center text-sm">🚙</span>
        Liste Voitures
      </button>
    </li>
  </>
)}


            {session?.user?.isSuperAdmin && (
              <li>
                <button
                  onClick={() => router.push("/liste_users")}
                  className={`w-full text-left p-2.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${isActive("/liste_users")
                    ? "bg-[#004571] text-white"
                    : "text-gray-600 hover:bg-[#004571] hover:text-white"
                    }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-sm">👤</span>
                  Comptes
                </button>
              </li>
            )}

          </ul>
        </div>


      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-56">
        <header className="bg-[#f8fafc] p-4 shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-[#004571]">{title ?? "OCT Intranet"}</h1>
            <div className="flex items-center gap-3">
              {/* Bouton de notification */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-[#004571] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <Image
                  src="/images/default_user.png"
                  alt="Profil"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-[#004571]">
                    {session?.user?.prenom} {session?.user?.nom}
                  </p>
                  <p className="text-xs text-gray-500">{session?.user?.matricule}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="ml-2 p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                  title="Déconnexion"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="flex gap-2">
            {alerts.chef && hasModule(2) && (
              <div className="animate-pulse bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t.alerts.chef.message}
                    </p>
                    <button
                      onClick={() => router.push("/listecongechef")}
                      className="mt-1 text-sm font-medium text-yellow-700 hover:text-yellow-600"
                    >
                      {t.alerts.chef.button} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {alerts.rh && hasModule(3) && (
              <div className="animate-pulse bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {t.alerts.rh.message}
                    </p>
                    <button
                      onClick={() => router.push("/listecongerh")}
                      className="mt-1 text-sm font-medium text-blue-700 hover:text-blue-600"
                    >
                      {t.alerts.rh.button} →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Panneau de notifications */}
        <div className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#004571]">Notifications</h2>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {alerts.chef && hasModule(2) && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t.alerts.chef.message}
                    </p>
                    <button
                      onClick={() => {
                        router.push("/listecongechef");
                        setShowNotifications(false);
                      }}
                      className="mt-1 text-sm font-medium text-yellow-700 hover:text-yellow-600"
                    >
                      {t.alerts.chef.button} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {alerts.rh && hasModule(3) && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {t.alerts.rh.message}
                    </p>
                    <button
                      onClick={() => {
                        router.push("/listecongerh");
                        setShowNotifications(false);
                      }}
                      className="mt-1 text-sm font-medium text-blue-700 hover:text-blue-600"
                    >
                      {t.alerts.rh.button} →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
