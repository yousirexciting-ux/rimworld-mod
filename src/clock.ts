import { HOURS_PER_DAY, TICKS_PER_HOUR } from "./config";
import { Pawn } from "./pawn";

export class Clock {
  tick = 0;
  pawns: Pawn[] = [];

  register(pawn: Pawn) {
    this.pawns.push(pawn);
  }

  stepTicks(ticks: number) {
    for (let i = 0; i < ticks; i++) {
      this.tick++;
      for (const pawn of this.pawns) {
        pawn.tick();
      }
    }
  }

  stepHours(hours: number) {
    this.stepTicks(hours * TICKS_PER_HOUR);
  }

  stepDays(days: number) {
    this.stepTicks(days * HOURS_PER_DAY * TICKS_PER_HOUR);
  }
}
