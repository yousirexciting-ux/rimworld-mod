export function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function lerp(current, target, delta) {
  const next = current + (target - current) * delta;
  return next;
}
