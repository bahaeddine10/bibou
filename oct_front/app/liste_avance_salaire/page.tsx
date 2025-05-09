"use client";

import Layout from "@/components/Layout";

export default function DashboardPage() {

  return (
    <Layout title="Liste des demandes avance sur salaire">
      <div className="p-6 pt-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Liste des demandes avance sur salaire
          </h2>
        </div>
      </div>
    </Layout>
  );
}
