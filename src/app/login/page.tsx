"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth, signOutAdmin } from "@/hooks/useAdminAuth";
import ParticleBackground from "@/components/ParticleBackground";

function isAuthorized(email: string | null): boolean {
  return (email ?? "").toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
}

export default function LoginPage() {
  const router = useRouter();
  const authState = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authState.status === "admin") router.replace("/dashboard");
  }, [authState.status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isAuthorized(credential.user.email)) {
        await signOutAdmin();
        setError("This account isn't authorized for the admin panel.");
      }
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <ParticleBackground />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(26,5,7,0.9), var(--color-background) 45%, var(--color-background))",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Hybrid Fit" className="h-16 w-16 object-contain" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">Hybrid Fit Admin</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in with the owner account</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl shadow-black/40 backdrop-blur"
        >
          {authState.status === "not-admin" && (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              You&apos;re signed in, but this account isn&apos;t the admin account.
            </p>
          )}
          {error && <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-text-primary outline-none transition focus:border-primary"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-text-primary outline-none transition focus:border-primary"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">Hybrid Fit · Admin Panel</p>
      </div>
    </main>
  );
}
