import { Capacities } from "./capacities";

export type Action = "move" | "meditate" | "breakThroughTry" | "gather" | "firstAid";

export interface ActionResult {
  canDo: boolean;
  reason?: string;
}

export class ActionGates {
  capacities: Capacities;
  mood: number;

  constructor(capacities: Capacities, mood: number) {
    this.capacities = capacities;
    this.mood = mood;
  }

  canDo(action: Action): ActionResult {
    switch (action) {
      case "move":
        return this.capacities.moving >= 0.15 && this.capacities.consciousness >= 0.2
          ? { canDo: true }
          : { canDo: false, reason: "moving or consciousness too low" };
      case "meditate":
        return this.capacities.consciousness >= 0.4 && this.capacities.breathing >= 0.4
          ? { canDo: true }
          : { canDo: false, reason: "needs stable breathing and consciousness" };
      case "breakThroughTry":
        return this.capacities.consciousness >= 0.6 && this.mood >= 0.5
          ? { canDo: true }
          : { canDo: false, reason: "insufficient mood or consciousness" };
      case "gather":
        return this.capacities.manipulation >= 0.35 && this.capacities.sight >= 0.3
          ? { canDo: true }
          : { canDo: false, reason: "needs manipulation and sight" };
      case "firstAid":
        return this.capacities.manipulation >= 0.4 && this.capacities.consciousness >= 0.45
          ? { canDo: true }
          : { canDo: false, reason: "needs steady hands and consciousness" };
      default:
        return { canDo: false, reason: "unknown action" };
    }
  }
}
