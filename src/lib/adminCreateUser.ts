import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig, db } from "./firebase";
import type { Gender } from "./types";

export interface NewUserInput {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
}

/**
 * Creates a brand-new member: a real Firebase Auth login (so they can sign
 * into the app immediately with these credentials) plus their Firestore
 * profile — same shape UserProfile.toMap() writes in the Flutter app.
 *
 * `createUserWithEmailAndPassword` on the PRIMARY app would sign the admin
 * out and sign in as the new user instead (Firebase Auth always adopts the
 * most-recently-created account as the active session). To avoid hijacking
 * the admin's own session, the account is created on a throwaway secondary
 * Firebase App instance, which is torn down immediately after.
 */
export async function createNewUser(input: NewUserInput): Promise<string> {
  const secondaryApp = initializeApp(firebaseConfig, `admin-create-user-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, input.email.trim(), input.password);
    await updateProfile(credential.user, { displayName: input.name });
    const uid = credential.user.uid;
    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", uid), {
      uid,
      email: input.email.trim(),
      name: input.name,
      age: input.age,
      gender: input.gender,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      photoUrl: null,
      profileComplete: true,
      createdAt: serverTimestamp(),
      isPremium: false,
    });

    return uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}
