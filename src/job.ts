import { Pawn } from "./pawn";
import { Thing, Position, World, ThingType } from "./world";
import { clamp01 } from "./utils";
import { TICKS_PER_HOUR } from "./config";

export type JobType = "drink" | "gather" | "sleep" | "meditate" | "danger";

export interface JobPlan {
  type: JobType;
  target: Thing;
}

interface ToilContext {
  pawn: Pawn;
  world: World;
  job: Job;
}

interface Toil {
  name: string;
  tick(ctx: ToilContext): boolean; // returns true when complete
}

class MoveToToil implements Toil {
  name = "MoveTo";
  target: Position;

  constructor(target: Position) {
    this.target = target;
  }

  tick(ctx: ToilContext): boolean {
    const pawn = ctx.pawn;
    const dx = this.target.x - pawn.position.x;
    const dy = this.target.y - pawn.position.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 0) return true;
    const speedTilesPerTick = Math.max(0.25, pawn.capacities.moving * 0.6);
    const step = Math.max(1, Math.floor(speedTilesPerTick));
    const moveX = Math.sign(dx) * Math.min(Math.abs(dx), step);
    const moveY = Math.sign(dy) * Math.min(Math.abs(dy), Math.max(0, step - Math.abs(moveX)));
    pawn.position.x += moveX;
    pawn.position.y += moveY;
    return false;
  }
}

class UseThingToil implements Toil {
  name = "UseThing";
  target: Thing;
  constructor(target: Thing) {
    this.target = target;
  }
  tick(): boolean {
    return true;
  }
}

class WaitToil implements Toil {
  name = "Wait";
  remaining: number;
  onTick?: (ctx: ToilContext) => void;

  constructor(duration: number, onTick?: (ctx: ToilContext) => void) {
    this.remaining = duration;
    this.onTick = onTick;
  }

  tick(ctx: ToilContext): boolean {
    if (this.remaining <= 0) return true;
    this.onTick?.(ctx);
    this.remaining -= 1;
    return this.remaining <= 0;
  }
}

class FinishToil implements Toil {
  name = "Finish";
  tick(): boolean {
    return true;
  }
}

function waitEffect(type: JobType, target: ThingType): (ctx: ToilContext) => void {
  switch (type) {
    case "drink":
      return (ctx) => {
        ctx.pawn.needs.needs.water.value = clamp01(ctx.pawn.needs.needs.water.value + 0.0045);
      };
    case "gather":
      return (ctx) => {
        ctx.pawn.needs.needs.food.value = clamp01(ctx.pawn.needs.needs.food.value + 0.0035);
      };
    case "sleep":
      return (ctx) => {
        const gain = 0.005 + ctx.pawn.capacities.consciousness * 0.002;
        ctx.pawn.needs.needs.rest.value = clamp01(ctx.pawn.needs.needs.rest.value + gain);
      };
    case "meditate":
      return (ctx) => {
        ctx.pawn.cultivationProgress = clamp01(ctx.pawn.cultivationProgress + 0.001);
        ctx.pawn.needs.needs.mind.value = clamp01(ctx.pawn.needs.needs.mind.value + 0.0015);
      };
    case "danger":
      return (ctx) => {
        const hazardChancePerTick = 0.04 / TICKS_PER_HOUR;
        if (Math.random() < hazardChancePerTick) {
          ctx.pawn.bleedingRate += 0.005;
        }
      };
    default:
      return () => {};
  }
}

export class Job {
  type: JobType;
  pawn: Pawn;
  target: Thing;
  world: World;
  toils: Toil[] = [];
  index = 0;
  finished = false;

  constructor(type: JobType, pawn: Pawn, target: Thing, world: World) {
    this.type = type;
    this.pawn = pawn;
    this.target = target;
    this.world = world;
    this.buildToils();
  }

  private buildToils() {
    const wait = new WaitToil(this.target.timeCostTicks, waitEffect(this.type, this.target.type));
    this.toils = [new MoveToToil(this.target.position), new UseThingToil(this.target), wait, new FinishToil()];
  }

  tick() {
    if (this.finished) return;
    const current = this.toils[this.index];
    const complete = current.tick({ pawn: this.pawn, world: this.world, job: this });
    if (complete) {
      this.index += 1;
      if (this.index >= this.toils.length) {
        this.finished = true;
      }
    }
  }
}
