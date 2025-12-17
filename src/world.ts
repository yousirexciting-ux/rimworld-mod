import { Pawn } from "./pawn";
import { clamp01 } from "./utils";
import { TICKS_PER_HOUR } from "./config";
import { Job, JobType, JobPlan } from "./job";

export interface Position {
  x: number;
  y: number;
}

export type ThingType =
  | "WaterSource"
  | "FoodNode"
  | "Bed"
  | "Campfire"
  | "QiNode"
  | "DangerZone";

export interface Thing {
  id: number;
  type: ThingType;
  position: Position;
  timeCostTicks: number;
}

export class World {
  width: number;
  height: number;
  pawns: Pawn[] = [];
  things: Thing[] = [];
  jobs: Job[] = [];
  tick = 0;

  constructor(width = 50, height = 50) {
    this.width = width;
    this.height = height;
    this.seedThings();
  }

  private seedThings() {
    const layout: { type: ThingType; position: Position; timeCostTicks: number }[] = [
      { type: "WaterSource", position: { x: 3, y: 3 }, timeCostTicks: 120 },
      { type: "FoodNode", position: { x: 12, y: 6 }, timeCostTicks: 180 },
      { type: "Bed", position: { x: 20, y: 20 }, timeCostTicks: 480 },
      { type: "Campfire", position: { x: 22, y: 20 }, timeCostTicks: 150 },
      { type: "QiNode", position: { x: 30, y: 10 }, timeCostTicks: 240 },
      { type: "DangerZone", position: { x: 40, y: 40 }, timeCostTicks: 200 },
    ];

    layout.forEach((entry, idx) => {
      this.things.push({ id: idx + 1, ...entry });
    });
  }

  registerPawn(pawn: Pawn, position: Position = { x: 0, y: 0 }) {
    pawn.position = { ...position };
    pawn.cultivationProgress = 0;
    pawn.currentJob = undefined;
    this.pawns.push(pawn);
  }

  addJob(job: Job) {
    this.jobs.push(job);
  }

  private distance(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  findNearest(type: ThingType, pos: Position): Thing | undefined {
    const candidates = this.things.filter((t) => t.type === type);
    let closest: Thing | undefined;
    let minDist = Number.POSITIVE_INFINITY;
    for (const t of candidates) {
      const d = this.distance(pos, t.position);
      if (d < minDist) {
        minDist = d;
        closest = t;
      }
    }
    return closest;
  }

  getTempAt(pos: Position): number {
    const base = 0.55;
    const campfire = this.findNearest("Campfire", pos);
    if (campfire) {
      const d = this.distance(pos, campfire.position);
      const bonus = clamp01(Math.max(0, 0.25 - d * 0.02));
      return clamp01(base + bonus);
    }
    return clamp01(base - 0.05);
  }

  getQiAt(pos: Position): number {
    const base = 0.2;
    const qi = this.findNearest("QiNode", pos);
    if (!qi) return base;
    const d = this.distance(pos, qi.position);
    const gain = Math.max(0, 0.4 - d * 0.03);
    return clamp01(base + gain);
  }

  getFilthAt(pos: Position): number {
    const base = 0.1;
    const danger = this.findNearest("DangerZone", pos);
    if (!danger) return base;
    const d = this.distance(pos, danger.position);
    const level = Math.max(0, 0.5 - d * 0.03);
    return clamp01(base + level);
  }

  private pickJobForPawn(pawn: Pawn): Job | undefined {
    if (pawn.dead || pawn.unconscious) return undefined;
    const needWater = pawn.needs.getValue("water");
    const needFood = pawn.needs.getValue("food");
    const needRest = pawn.needs.getValue("rest");
    const qiNeed = pawn.needs.getValue("mind");

    const choices: JobPlan[] = [];
    const waterThing = this.findNearest("WaterSource", pawn.position);
    if (waterThing && needWater < 0.6) {
      choices.push({ type: "drink", target: waterThing });
    }
    const foodThing = this.findNearest("FoodNode", pawn.position);
    if (foodThing && needFood < 0.6) {
      choices.push({ type: "gather", target: foodThing });
    }
    const bed = this.findNearest("Bed", pawn.position);
    if (bed && needRest < 0.45) {
      choices.push({ type: "sleep", target: bed });
    }
    const qiNode = this.findNearest("QiNode", pawn.position);
    if (qiNode && qiNeed < 0.75) {
      choices.push({ type: "meditate", target: qiNode });
    }
    const danger = this.findNearest("DangerZone", pawn.position);
    if (danger && this.tick % (TICKS_PER_HOUR * 10) === 0) {
      choices.push({ type: "danger", target: danger });
    }

    if (choices.length === 0) return undefined;
    const plan = choices[0];
    return new Job(plan.type, pawn, plan.target, this);
  }

  private ensureJobs() {
    for (const pawn of this.pawns) {
      if (!pawn.currentJob || pawn.currentJob.finished) {
        const next = this.pickJobForPawn(pawn);
        if (next) {
          pawn.currentJob = next;
          this.addJob(next);
        }
      }
    }
  }

  private applyHazards(pawn: Pawn) {
    const danger = this.findNearest("DangerZone", pawn.position);
    if (!danger) return;
    const dist = this.distance(pawn.position, danger.position);
    if (dist > 1) return;
    const chancePerHour = 0.25;
    const chancePerTick = chancePerHour / TICKS_PER_HOUR;
    if (Math.random() < chancePerTick) {
      pawn.bleedingRate += 0.0025;
      pawn.hediffs.infection.setSeverity(clamp01(pawn.hediffs.infection.severity + 0.02));
      pawn.needs.needs.mind.value = clamp01(pawn.needs.needs.mind.value - 0.05);
    }
  }

  stepTicks(ticks: number) {
    for (let i = 0; i < ticks; i++) {
      this.tick++;
      this.ensureJobs();
      for (const job of [...this.jobs]) {
        if (!job.finished) {
          job.tick();
        }
      }
      this.jobs = this.jobs.filter((j) => !j.finished);
      for (const pawn of this.pawns) {
        this.applyHazards(pawn);
        pawn.tick(1, this);
      }
    }
  }
}
