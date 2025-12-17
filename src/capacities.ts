import { Hediff } from "./hediff";
import { NeedType, clamp01 } from "./utils";

export interface Capacities {
  consciousness: number;
  moving: number;
  manipulation: number;
  sight: number;
  breathing: number;
  metabolism: number;
}

export interface CapacityInputs {
  hediffs: Record<string, Hediff>;
  needs: Record<NeedType, { value: number }>;
  bloodVolume: number;
  baseCaps?: Partial<Capacities>;
}

function hediffImpact(type: string, severity: number): number {
  switch (type) {
    case "hunger":
      return clamp01(1 - severity * 0.45);
    case "dehydration":
      return clamp01(1 - severity * 0.6);
    case "infection":
      return clamp01(1 - severity * 0.35);
    case "fatigue":
      return clamp01(1 - severity * 0.5);
    case "temp_stress":
      return clamp01(1 - severity * 0.4);
    case "blood_loss":
      return clamp01(1 - severity * 0.5);
    default:
      return 1;
  }
}

function needMultiplier(needs: CapacityInputs["needs"]): number {
  const hungerPenalty = (1 - needs.food.value) * 0.15;
  const thirstPenalty = (1 - needs.water.value) * 0.2;
  const restPenalty = (1 - needs.rest.value) * 0.25;
  const moodPenalty = (1 - needs.mind.value) * 0.2;
  return clamp01(1 - (hungerPenalty + thirstPenalty + restPenalty + moodPenalty));
}

function painMultiplier(hediffs: Record<string, Hediff>): number {
  const painSources = ["infection", "temp_stress"];
  const severitySum = painSources.reduce((acc, key) => acc + (hediffs[key]?.severity ?? 0), 0);
  return clamp01(1 - severitySum * 0.25);
}

function hediffMultiplier(hediffs: Record<string, Hediff>): number {
  return Object.values(hediffs).reduce((mult, h) => mult * hediffImpact(h.type, h.severity), 1);
}

export function computeCapacities(inputs: CapacityInputs): Capacities {
  const base: Capacities = {
    consciousness: inputs.baseCaps?.consciousness ?? 1,
    moving: inputs.baseCaps?.moving ?? 1,
    manipulation: inputs.baseCaps?.manipulation ?? 1,
    sight: inputs.baseCaps?.sight ?? 1,
    breathing: inputs.baseCaps?.breathing ?? 1,
    metabolism: inputs.baseCaps?.metabolism ?? 1,
  };

  const needMult = needMultiplier(inputs.needs);
  const hedMult = hediffMultiplier(inputs.hediffs);
  const painMult = painMultiplier(inputs.hediffs);
  const bloodMult = clamp01(inputs.bloodVolume);

  const capValue = (value: number, extra: number = 1) => clamp01(value * needMult * hedMult * painMult * bloodMult * extra);

  return {
    consciousness: capValue(base.consciousness, 1 - (inputs.hediffs["fatigue"]?.severity ?? 0) * 0.4),
    moving: capValue(base.moving, 1 - (inputs.hediffs["hunger"]?.severity ?? 0.2) * 0.25),
    manipulation: capValue(base.manipulation, 1 - (inputs.hediffs["fatigue"]?.severity ?? 0) * 0.25),
    sight: capValue(base.sight, 1 - (inputs.hediffs["infection"]?.severity ?? 0) * 0.2),
    breathing: capValue(base.breathing, 1 - (inputs.hediffs["temp_stress"]?.severity ?? 0) * 0.15),
    metabolism: capValue(base.metabolism),
  };
}
