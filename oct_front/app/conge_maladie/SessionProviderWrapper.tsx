"use client"; // Mark this component as a Client Component

import { SessionProvider } from 'next-auth/react';
import DashboardPage from './page';

export default function SessionProviderWrapper() {
  return (
    <SessionProvider>
      <DashboardPage />
    </SessionProvider>
  );
}