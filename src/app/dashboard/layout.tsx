"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminDataProvider, useAdminData } from "@/hooks/useAdminData";
import Sidebar from "@/components/Sidebar";
import ParticleBackground from "@/components/ParticleBackground";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authState = useAdminAuth();

  useEffect(() => {
    if (authState.status === "signed-out" || authState.status === "not-admin") {
      router.replace("/login");
    }
  }, [authState.status, router]);

  if (authState.status !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </main>
    );
  }

  return (
    <AdminDataProvider>
      <DashboardShell email={authState.user.email}>{children}</DashboardShell>
    </AdminDataProvider>
  );
}

function DashboardShell({ email, children }: { email: string | null; children: React.ReactNode }) {
  const { unreadTotal } = useAdminData();

  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "linear-gradient(to bottom, rgba(26,5,7,0.55), var(--color-background) 40%, var(--color-background))",
        }}
      />
      <Sidebar email={email} unread={unreadTotal} />
      <div className="relative z-10 ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
