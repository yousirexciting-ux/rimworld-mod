import { clamp01, NeedType } from "./utils";
import { NEED_DECAY_PER_HOUR, TICKS_PER_HOUR } from "./config";

export interface Need {
  type: NeedType;
  value: number; // 0..1
}

export class NeedsTracker {
  needs: Record<NeedType, Need>;

  constructor(initial?: Partial<Record<NeedType, number>>) {
    this.needs = {
      food: { type: "food", value: initial?.food ?? 1 },
      water: { type: "water", value: initial?.water ?? 1 },
      rest: { type: "rest", value: initial?.rest ?? 1 },
      temp: { type: "temp", value: initial?.temp ?? 0.5 },
      mind: { type: "mind", value: initial?.mind ?? 0.9 },
    };
  }

  decay(ticks: number) {
    const hours = ticks / TICKS_PER_HOUR;
    const decayFood = NEED_DECAY_PER_HOUR.food * hours;
    const decayWater = NEED_DECAY_PER_HOUR.water * hours;
    const decayRest = NEED_DECAY_PER_HOUR.rest * hours;
    const decayMind = NEED_DECAY_PER_HOUR.mind * hours;

    this.needs.food.value = clamp01(this.needs.food.value - decayFood);
    this.needs.water.value = clamp01(this.needs.water.value - decayWater);
    this.needs.rest.value = clamp01(this.needs.rest.value - decayRest);
    this.needs.mind.value = clamp01(this.needs.mind.value - decayMind);
  }

  adjustTemperature(delta: number) {
    this.needs.temp.value = clamp01(this.needs.temp.value + delta);
  }

  getValue(type: NeedType): number {
    return this.needs[type].value;
  }
}
