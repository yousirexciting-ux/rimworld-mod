import { clamp01 } from "./utils.js";

export class Hediff {
  constructor(type, severity = 0, trend = 0, stages = [
    { label: "minor", minSeverity: 0 },
    { label: "major", minSeverity: 0.33 },
    { label: "extreme", minSeverity: 0.66 },
  ]) {
    this.type = type;
    this.severity = severity;
    this.trend = trend;
    this.stages = stages;
  }

  tick(delta) {
    this.severity = clamp01(this.severity + this.trend * delta);
  }

  setSeverity(value) {
    this.severity = clamp01(value);
  }

  currentStage() {
    const sorted = [...this.stages].sort((a, b) => b.minSeverity - a.minSeverity);
    for (const stage of sorted) {
      if (this.severity >= stage.minSeverity) return stage;
    }
    return this.stages[0];
  }
}
