"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function RootPage() {
  const router = useRouter();
  const authState = useAdminAuth();

  useEffect(() => {
    if (authState.status === "loading") return;
    router.replace(authState.status === "admin" ? "/dashboard" : "/login");
  }, [authState.status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
    </main>
  );
}
