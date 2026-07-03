// Mirrors lib/core/utils/body_metrics_calculator.dart exactly, so numbers
// shown here always match what the member sees in the app.

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi <= 0) return "—";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// Mifflin-St Jeor equation.
export function calculateBmr(weightKg: number, heightCm: number, age: number, isMale: boolean): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return isMale ? base + 5 : base - 161;
}

export function cmToFeetInchesParts(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function cmToFeetInches(cm: number): string {
  const { feet, inches } = cmToFeetInchesParts(cm);
  return `${feet}'${inches}"`;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}
