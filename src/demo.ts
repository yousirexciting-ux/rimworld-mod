import { DAYS_TO_SIMULATE, HOURS_PER_DAY, TICKS_PER_HOUR } from "./config";
import { ActionGates } from "./actionGates";
import { Pawn } from "./pawn";
import { World } from "./world";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function printDay(day: number, pawn: Pawn) {
  const needs = pawn.needs.needs;
  const hediffs = pawn.hediffs;
  const caps = pawn.capacities;
  const gates = new ActionGates(caps, pawn.getMood());
  const actions = ["move", "meditate", "breakThroughTry", "gather", "firstAid"] as const;
  const actionLines = actions
    .map((a) => {
      const result = gates.canDo(a);
      return `${a}: ${result.canDo ? "yes" : "no"}${result.reason ? ` (${result.reason})` : ""}`;
    })
    .join(" | ");

  const line = [
    `Day ${day}`,
    `Needs f:${formatPercent(needs.food.value)} w:${formatPercent(needs.water.value)} r:${formatPercent(needs.rest.value)} t:${formatPercent(needs.temp.value)} m:${formatPercent(needs.mind.value)}`,
    `Hediffs hunger:${formatPercent(hediffs.hunger.severity)} dehydration:${formatPercent(hediffs.dehydration.severity)} blood_loss:${formatPercent(hediffs.blood_loss.severity)} infection:${formatPercent(hediffs.infection.severity)} fatigue:${formatPercent(hediffs.fatigue.severity)} temp_stress:${formatPercent(hediffs.temp_stress.severity)}`,
    `Caps con:${formatPercent(caps.consciousness)} mov:${formatPercent(caps.moving)} manip:${formatPercent(caps.manipulation)} sight:${formatPercent(caps.sight)} breath:${formatPercent(caps.breathing)} meta:${formatPercent(caps.metabolism)}`,
    `Pos (${pawn.position.x},${pawn.position.y}) Job:${pawn.currentJob?.type ?? "idle"}`,
    `Cultivation:${formatPercent(pawn.cultivationProgress)} Unconscious:${pawn.unconscious} Dead:${pawn.dead}`,
    `Actions -> ${actionLines}`,
  ];
  console.log(line.join("\n"));
  console.log("------------------");
}

export function runDemo() {
  const pawn = new Pawn("DemoColonist");
  const world = new World();
  world.registerPawn(pawn, { x: 1, y: 1 });

  for (let day = 1; day <= DAYS_TO_SIMULATE; day++) {
    world.stepTicks(HOURS_PER_DAY * TICKS_PER_HOUR);
    printDay(day, pawn);
    if (pawn.dead) break;
  }
}

// If running in browser, attach to window for manual triggering
if (typeof window !== "undefined") {
  (window as any).runDemo = runDemo;
}

// Run immediately when executed via Node
if (typeof window === "undefined") {
  runDemo();
}
