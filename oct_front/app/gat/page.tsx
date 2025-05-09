"use client";

export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

export default function GATPage() {
  const router = useRouter();

  useEffect(() => {
    // Ouvrir le lien dans un nouvel onglet
    window.open("https://mycover.tn", "_blank");
    // Retourner à la page précédente
    router.back();
  }, [router]);

  return (
    <Layout title="GAT - Assurance">
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004571] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers GAT Assurance...</p>
        </div>
      </div>
    </Layout>
  );
} 