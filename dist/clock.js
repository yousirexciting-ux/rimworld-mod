import { HOURS_PER_DAY, TICKS_PER_HOUR } from "./config.js";

export class Clock {
  constructor() {
    this.tick = 0;
    this.pawns = [];
  }

  register(pawn) {
    this.pawns.push(pawn);
  }

  stepTicks(ticks) {
    for (let i = 0; i < ticks; i++) {
      this.tick++;
      for (const pawn of this.pawns) {
        pawn.tick();
      }
    }
  }

  stepHours(hours) {
    this.stepTicks(hours * TICKS_PER_HOUR);
  }

  stepDays(days) {
    this.stepTicks(days * HOURS_PER_DAY * TICKS_PER_HOUR);
  }
}
