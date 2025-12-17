export class ActionGates {
  constructor(capacities, mood) {
    this.capacities = capacities;
    this.mood = mood;
  }

  canDo(action) {
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
