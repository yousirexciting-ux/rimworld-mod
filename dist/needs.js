import { clamp01 } from "./utils.js";
import { NEED_DECAY_PER_HOUR, TICKS_PER_HOUR } from "./config.js";

export class NeedsTracker {
  constructor(initial = {}) {
    this.needs = {
      food: { type: "food", value: initial.food ?? 1 },
      water: { type: "water", value: initial.water ?? 1 },
      rest: { type: "rest", value: initial.rest ?? 1 },
      temp: { type: "temp", value: initial.temp ?? 0.5 },
      mind: { type: "mind", value: initial.mind ?? 0.9 },
    };
  }

  decay(ticks) {
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

  adjustTemperature(delta) {
    this.needs.temp.value = clamp01(this.needs.temp.value + delta);
  }

  getValue(type) {
    return this.needs[type].value;
  }
}
