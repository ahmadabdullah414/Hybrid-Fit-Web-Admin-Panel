"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, type UserCredential, type User } from "firebase/auth";
import { auth, isAdminEmail } from "@/lib/firebase";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-admin"; user: User }
  | { status: "admin"; user: User };

/** Tracks Firebase auth state and gates it to the admin email allowlist. */
export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({ status: "signed-out" });
        return;
      }
      setState(isAdminEmail(user.email) ? { status: "admin", user } : { status: "not-admin", user });
    });
    return unsubscribe;
  }, []);

  return state;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/** Returns null if the user closed/cancelled the Google popup. */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  try {
    return await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
    throw err;
  }
}
