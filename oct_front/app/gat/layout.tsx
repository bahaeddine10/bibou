"use client";

import { SessionProvider } from "next-auth/react";

export default function GatLayout({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
