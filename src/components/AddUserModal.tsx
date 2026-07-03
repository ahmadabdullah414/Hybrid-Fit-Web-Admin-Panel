"use client";

import { useMemo, useState } from "react";
import { createNewUser } from "@/lib/adminCreateUser";
import { calculateBmi, calculateBmr, bmiCategory, feetInchesToCm, lbsToKg } from "@/lib/metrics";
import type { Gender } from "@/lib/types";

type HeightUnit = "cm" | "ftin";
type WeightUnit = "kg" | "lbs";

export default function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [heightCmInput, setHeightCmInput] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weightInput, setWeightInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const heightCm = useMemo(() => {
    if (heightUnit === "cm") return parseFloat(heightCmInput) || 0;
    return feetInchesToCm(parseFloat(heightFeet) || 0, parseFloat(heightInches) || 0);
  }, [heightUnit, heightCmInput, heightFeet, heightInches]);

  const weightKg = useMemo(() => {
    const raw = parseFloat(weightInput) || 0;
    return weightUnit === "kg" ? raw : lbsToKg(raw);
  }, [weightUnit, weightInput]);

  const ageNum = parseInt(age, 10) || 0;
  const hasMetrics = ageNum > 0 && heightCm > 0 && weightKg > 0;
  const bmi = hasMetrics ? calculateBmi(weightKg, heightCm) : null;
  const bmr = hasMetrics ? calculateBmr(weightKg, heightCm, ageNum, gender === "male") : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!hasMetrics) {
      setError("Please fill in age, height, and weight.");
      return;
    }

    setSubmitting(true);
    try {
      await createNewUser({
        name: name.trim(),
        email: email.trim(),
        password,
        age: ageNum,
        gender,
        heightCm,
        weightKg,
      });
      onCreated();
      onClose();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") setError("An account already exists with that email.");
      else if (code === "auth/invalid-email") setError("That email address looks invalid.");
      else setError("Couldn't create the account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Add New User</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Jane Doe" />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="jane@example.com"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Confirm Password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input
                type="number"
                min={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className={inputClass}
                placeholder="25"
              />
            </Field>
            <Field label="Gender">
              <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClass}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
          </div>

          <Field label="Height" trailing={<UnitToggle value={heightUnit} options={["cm", "ftin"]} labels={["cm", "ft/in"]} onChange={setHeightUnit} />}>
            {heightUnit === "cm" ? (
              <input
                type="number"
                min={1}
                value={heightCmInput}
                onChange={(e) => setHeightCmInput(e.target.value)}
                required
                className={inputClass}
                placeholder="173"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="5 ft"
                />
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className={inputClass}
                  placeholder="8 in"
                />
              </div>
            )}
          </Field>

          <Field label="Weight" trailing={<UnitToggle value={weightUnit} options={["kg", "lbs"]} labels={["kg", "lbs"]} onChange={setWeightUnit} />}>
            <input
              type="number"
              min={1}
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              required
              className={inputClass}
              placeholder={weightUnit === "kg" ? "75" : "165"}
            />
          </Field>

          {hasMetrics && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-3">
              <div>
                <p className="text-xs text-text-muted">BMI</p>
                <p className="font-bold text-text-primary">
                  {bmi!.toFixed(1)} <span className="text-xs font-normal text-text-muted">({bmiCategory(bmi!)})</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">BMR</p>
                <p className="font-bold text-text-primary">{bmr!.toFixed(0)} kcal/day</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark px-4 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary";

function Field({ label, trailing, children }: { label: string; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-text-secondary">
      <span className="flex items-center justify-between">
        {label}
        {trailing}
      </span>
      {children}
    </label>
  );
}

function UnitToggle<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: readonly string[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-border text-xs">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 font-medium transition ${
            value === opt ? "bg-primary text-white" : "bg-background text-text-muted hover:text-text-secondary"
          }`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
