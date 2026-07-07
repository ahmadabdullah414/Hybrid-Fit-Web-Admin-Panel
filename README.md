# Hybrid Fit — Web Admin Panel

A web-based admin dashboard for the Hybrid Fit app: member directory, premium
users, and the same owner-chat inbox available in the mobile app's admin
panel — all reading/writing the same Firebase project as the Flutter app.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Firebase Auth + Firestore (client SDK) — same project as the mobile app

## Setup

1. **Firebase Web app config** — this needs a *Web* app registered in the
   same Firebase project as the mobile app (separate from the Android
   `google-services.json`). In Firebase Console → Project Settings → Your
   apps → Add app → Web (`</>`), register it, then copy the `firebaseConfig`
   values.

2. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_ADMIN_EMAIL=pakadil101@gmail.com,hybridstrengthnfitness@gmail.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=h9abl4nh
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hybridfit
   ```

   The two Cloudinary values are the same unsigned account/preset the
   Flutter app's `CloudinaryService` already uses — not secret (an unsigned
   preset is designed to be embedded client-side), so images uploaded from
   either platform land in the same media library.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll land on
   `/login`. Sign in with either admin account's email/password used in the
   mobile app (`pakadil101@gmail.com` or `hybridstrengthnfitness@gmail.com`),
   or with Google. Any other account is rejected client-side and by
   `isAdmin()` in `firestore.rules`.

## Google Sign-In — two things to check in Firebase Console

1. **Authentication → Sign-in method → Google** must be toggled on (same
   requirement as the mobile app). If it's already enabled for the mobile
   app, it's enabled here too — it's a per-project setting, not per-app.
2. **Authentication → Settings → Authorized domains** must include the
   domain this panel is served from. `localhost` is authorized by default;
   your Vercel domain (e.g. `hybrid-fit-web-admin-panel.vercel.app`, or a
   custom domain) is **not**, and must be added manually or Google Sign-In
   will fail with `auth/unauthorized-domain` once deployed.

## Deploying on Vercel

1. Push this repo to GitHub (already wired to
   `https://github.com/ahmadabdullah414/Hybrid-Fit-Web-Admin-Panel`).
2. In Vercel: **New Project** → import the repo.
3. Add the same six `NEXT_PUBLIC_FIREBASE_*` variables, plus
   `NEXT_PUBLIC_ADMIN_EMAIL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and
   `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, under **Settings → Environment
   Variables**.
4. Deploy. No other config needed — this is a static/client-rendered app,
   Vercel's Next.js defaults work out of the box.
5. Add the resulting `*.vercel.app` domain (and any custom domain) to
   Firebase's authorized domains list — see above — or Google Sign-In will
   fail on the live site even though it works locally.

## Firestore rules

This panel relies on the **same `firestore.rules`** as the mobile app —
specifically the `isAdmin()` check (matches on the signed-in user's email),
`owner_chat/{uid}` + `owner_chat/{uid}/messages/{messageId}`, and now also
`home_banners/{bannerId}` + `admin_notifications/{notificationId}`. If those
aren't published on the live Firebase project, the panel will authenticate
fine but every Firestore read/write will fail with `permission-denied`.

## What's here

- **Dashboard** (`/dashboard`) — total users, premium users, active
  conversations, unread messages, and a preview of the newest members.
- **Users** (`/dashboard/users`) — every member: photo, name, email, age,
  height (cm + ft/in), weight (kg + lbs), BMI, BMR, and a delete action.
  Search by name or email.
- **Premium Users** (`/dashboard/premium`) — same table, filtered to
  `isPremium`.
- **Inbox** (`/dashboard/inbox`) — every member's conversation, pin up to 3
  to the top, unread highlighting, important-message star, search by name
  or email. Click through to a full chat thread with the same
  send/edit/delete/mark-important/read-receipt behavior as the app.
- **Home Banners** (`/dashboard/banners`) — manage the Home screen's image
  carousel: add/edit/delete a banner (image + optional title + link), with
  a live preview sized and animated exactly like the in-app slider. Shares
  the `home_banners` Firestore collection with the mobile admin panel.
- **Notify Users** (`/dashboard/notify-users`) — broadcast an update to
  every member: optional title, description, image and link (at least one
  required), oldest-first list with new posts landing at the bottom, and
  silent edit/delete (no "edited"/"deleted" marker shown to members).
  Shares the `admin_notifications` collection with the mobile admin panel.
- **Notification bell** (top of the sidebar) — same red-dot-when-unread
  behavior as the Home screen's bell in the app, previewing the latest
  Notify Users updates; opening it marks them seen (per-browser, via
  `localStorage`, independent of the mobile app's own per-device state).

Note: deleting a user here removes their Firestore data (profile + chat
thread) the same way the mobile admin panel does, but — like the mobile
app — it **cannot** remove their Firebase Auth login itself. That requires
the Admin SDK / a Cloud Function, which this project doesn't have.
