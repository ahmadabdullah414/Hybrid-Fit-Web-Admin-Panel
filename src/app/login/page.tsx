"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth, signOutAdmin, signInWithGoogle } from "@/hooks/useAdminAuth";
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const credential = await signInWithGoogle();
      if (credential && !isAuthorized(credential.user.email)) {
        await signOutAdmin();
        setError("This Google account isn't authorized for the admin panel.");
      }
    } catch {
      setError("Couldn't sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary-muted">
            <span className="text-3xl font-black italic tracking-tight text-primary">HF</span>
          </div>
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

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <div className="h-px flex-1 bg-border" />
            or continue with
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 font-semibold text-text-primary transition hover:border-primary/50 hover:bg-surface-elevated disabled:opacity-60"
          >
            <GoogleIcon />
            {googleLoading ? "Signing in…" : "Sign in with Google"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">Hybrid Fit · Admin Panel</p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 01-2.4 3.63v3h3.89c2.28-2.1 3.56-5.2 3.56-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.89-3c-1.08.73-2.46 1.16-4.04 1.16-3.1 0-5.73-2.1-6.67-4.92H1.3v3.09A12 12 0 0012 24z"
      />
      <path fill="#FBBC05" d="M5.33 14.32a7.2 7.2 0 010-4.64V6.59H1.3a12 12 0 000 10.82l4.03-3.09z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0A12 12 0 001.3 6.59l4.03 3.09C6.27 6.86 8.9 4.75 12 4.75z"
      />
    </svg>
  );
}
