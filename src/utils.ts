export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function lerp(current: number, target: number, delta: number): number {
  const next = current + (target - current) * delta;
  return next;
}

export type NeedType = "food" | "water" | "rest" | "temp" | "mind";
export type HediffType =
  | "hunger"
  | "dehydration"
  | "blood_loss"
  | "infection"
  | "fatigue"
  | "temp_stress";

export type CapacityType =
  | "consciousness"
  | "moving"
  | "manipulation"
  | "sight"
  | "breathing"
  | "metabolism";
