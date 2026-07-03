"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { calculateBmi, calculateBmr, bmiCategory, cmToFeetInches, kgToLbs } from "@/lib/metrics";
import { deleteUserData } from "@/lib/users";
import type { UserProfile } from "@/lib/types";

export default function UserTable({ users }: { users: UserProfile[] }) {
  const router = useRouter();
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [confirmUid, setConfirmUid] = useState<string | null>(null);

  async function handleDelete(uid: string) {
    setDeletingUid(uid);
    try {
      await deleteUserData(uid);
    } finally {
      setDeletingUid(null);
      setConfirmUid(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
        No members match here yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface/80 backdrop-blur">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            <th className="px-5 py-3.5 font-medium">Member</th>
            <th className="px-5 py-3.5 font-medium">Age</th>
            <th className="px-5 py-3.5 font-medium">Gender</th>
            <th className="px-5 py-3.5 font-medium">Height</th>
            <th className="px-5 py-3.5 font-medium">Weight</th>
            <th className="px-5 py-3.5 font-medium">BMI</th>
            <th className="px-5 py-3.5 font-medium">BMR</th>
            <th className="px-5 py-3.5 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const hasMetrics = u.age != null && u.heightCm != null && u.weightKg != null;
            const bmi = hasMetrics ? calculateBmi(u.weightKg!, u.heightCm!) : null;
            const bmr = hasMetrics ? calculateBmr(u.weightKg!, u.heightCm!, u.age!, u.gender === "male") : null;

            return (
              <tr key={u.uid} className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar url={u.photoUrl} name={u.name || u.email} size={36} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">{u.name || "Unnamed member"}</p>
                      <p className="truncate text-xs text-text-muted">{u.email}</p>
                    </div>
                    {u.isPremium && (
                      <span className="ml-1 shrink-0 rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        PRO
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{u.age ?? "—"}</td>
                <td className="px-5 py-3.5 capitalize text-text-secondary">{u.gender}</td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {u.heightCm != null ? (
                    <>
                      <span className="font-semibold text-text-primary">{cmToFeetInches(u.heightCm)}</span>
                      <span className="ml-1 text-xs text-text-muted">({u.heightCm.toFixed(0)} cm)</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {u.weightKg != null ? (
                    <>
                      <span className="font-semibold text-text-primary">{u.weightKg.toFixed(1)} kg</span>
                      <span className="ml-1 text-xs text-text-muted">({kgToLbs(u.weightKg).toFixed(1)} lbs)</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">
                  {bmi != null ? (
                    <>
                      {bmi.toFixed(1)}
                      <span className="ml-1 text-xs text-text-muted">({bmiCategory(bmi)})</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5 text-text-secondary">{bmr != null ? `${bmr.toFixed(0)} kcal` : "—"}</td>
                <td className="px-5 py-3.5 text-right">
                  {confirmUid === u.uid ? (
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <span className="text-xs text-text-muted">Delete?</span>
                      <button
                        onClick={() => handleDelete(u.uid)}
                        disabled={deletingUid === u.uid}
                        className="rounded-lg bg-error px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {deletingUid === u.uid ? "…" : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmUid(null)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/dashboard/inbox/${u.uid}`)}
                        className="rounded-lg p-2 text-text-muted transition hover:bg-primary-muted hover:text-primary"
                        title="Open chat"
                      >
                        <ChatIcon />
                      </button>
                      <button
                        onClick={() => setConfirmUid(u.uid)}
                        className="rounded-lg p-2 text-text-muted transition hover:bg-error/10 hover:text-error"
                        title="Delete account"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12a8 8 0 10-3.5 6.6L21 20l-1.2-3.6A7.9 7.9 0 0021 12z" />
    </svg>
  );
}
