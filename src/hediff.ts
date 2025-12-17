import { clamp01, HediffType } from "./utils";

export interface HediffStage {
  label: string;
  minSeverity: number;
}

export class Hediff {
  type: HediffType;
  severity: number; // 0..1
  trend: number; // per tick
  stages: HediffStage[];

  constructor(
    type: HediffType,
    severity = 0,
    trend = 0,
    stages: HediffStage[] = [
      { label: "minor", minSeverity: 0 },
      { label: "major", minSeverity: 0.33 },
      { label: "extreme", minSeverity: 0.66 },
    ]
  ) {
    this.type = type;
    this.severity = severity;
    this.trend = trend;
    this.stages = stages;
  }

  tick(delta: number) {
    this.severity = clamp01(this.severity + this.trend * delta);
  }

  setSeverity(value: number) {
    this.severity = clamp01(value);
  }

  currentStage(): HediffStage {
    const sorted = [...this.stages].sort((a, b) => b.minSeverity - a.minSeverity);
    for (const stage of sorted) {
      if (this.severity >= stage.minSeverity) return stage;
    }
    return this.stages[0];
  }
}
