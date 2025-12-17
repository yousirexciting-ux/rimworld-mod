export const TICKS_PER_HOUR = 120;
export const HOURS_PER_DAY = 24;
export const DAYS_TO_SIMULATE = 30;

export const NEED_DECAY_PER_HOUR = {
  food: 0.004,
  water: 0.004,
  rest: 0.005,
  temp: 0.0,
  mind: 0.003,
} as const;

export const AMBIENT_TEMPERATURE_TARGET = 0.82; // pushes pawn toward heat stress
export const TEMPERATURE_DRIFT_PER_TICK = 0.002;

export const BLOOD_INITIAL = 1.0;
export const BLEED_RATE_PER_HOUR = 0.004;
export const BLEED_HEAL_FACTOR = 0.25; // bleeding slows down as pawn stabilizes
export const BLOOD_RECOVERY_PER_HOUR = 0.0025;

export const INFECTION_GROWTH_PER_HOUR = 0.0025;
export const INFECTION_MAX = 0.4;

export const HEDIFF_THRESHOLDS = {
  hunger: 0.2,
  dehydration: 0.25,
  fatigue: 0.15,
  tempLow: 0.3,
  tempHigh: 0.7,
};

export const CRITICAL_BODY_PARTS = ["head", "heart", "torso"] as const;
