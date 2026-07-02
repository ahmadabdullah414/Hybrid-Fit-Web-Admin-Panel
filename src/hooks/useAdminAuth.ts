"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, ADMIN_EMAIL } from "@/lib/firebase";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-admin"; user: User }
  | { status: "admin"; user: User };

/** Tracks Firebase auth state and gates it to the single admin email. */
export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setState({ status: "signed-out" });
        return;
      }
      const isAdmin = (user.email ?? "").toLowerCase() === ADMIN_EMAIL;
      setState(isAdmin ? { status: "admin", user } : { status: "not-admin", user });
    });
    return unsubscribe;
  }, []);

  return state;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}
