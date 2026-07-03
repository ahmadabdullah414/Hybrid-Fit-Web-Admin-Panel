import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "pakadil101@gmail.com").toLowerCase();

// Every page here is "use client" and only ever touches `auth`/`db` after
// mount (inside useEffect/handlers), never during render. But Next.js still
// executes client component modules once server-side to produce the static
// shell at build time — and Firebase's getAuth() validates the API key
// immediately, which crashes `next build` if it runs before real env vars
// exist (e.g. a fresh checkout, or a Vercel preview with no key set yet).
// Skipping initialization outside the browser avoids that entirely.
const isBrowser = typeof window !== "undefined";

// Guard against re-initializing on every hot-reload / client navigation.
export const firebaseApp: FirebaseApp | undefined = isBrowser
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;
export const auth = (isBrowser ? getAuth(firebaseApp!) : undefined) as Auth;
export const db = (isBrowser ? getFirestore(firebaseApp!) : undefined) as Firestore;
