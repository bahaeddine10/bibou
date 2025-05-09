"use client"; // Mark this component as a Client Component

import { SessionProvider } from 'next-auth/react';
import DemandecongePage from './page';

export default function SessionProviderWrapper() {
  return (
    <SessionProvider>
      <DemandecongePage />
    </SessionProvider>
  );
}