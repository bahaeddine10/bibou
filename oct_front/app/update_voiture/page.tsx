"use client";
export const dynamic = "force-dynamic";

import Layout from "@/components/Layout";
import { Suspense } from "react";
import UpdateForm from "./UpdateForm"; // we'll move the core form there

export default function UpdateVoiturePage() {
  return (
    <Layout title="Modifier Voiture">
      <Suspense fallback={<div>Chargement...</div>}>
        <UpdateForm />
      </Suspense>
    </Layout>
  );
}
