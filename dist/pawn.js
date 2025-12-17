import {
  AMBIENT_TEMPERATURE_TARGET,
  BLEED_HEAL_FACTOR,
  BLEED_RATE_PER_HOUR,
  BLOOD_INITIAL,
  BLOOD_RECOVERY_PER_HOUR,
  CRITICAL_BODY_PARTS,
  HEDIFF_THRESHOLDS,
  INFECTION_GROWTH_PER_HOUR,
  INFECTION_MAX,
  TICKS_PER_HOUR,
  TEMPERATURE_DRIFT_PER_TICK
} from "./config.js";
import { Hediff } from "./hediff.js";
import { NeedsTracker } from "./needs.js";
import { computeCapacities } from "./capacities.js";
import { clamp01 } from "./utils.js";
export class Pawn {
  constructor(name) {
    this.ticksAlive = 0;
    this.needs = new NeedsTracker();
    this.hediffs = {
      hunger: new Hediff("hunger"),
      dehydration: new Hediff("dehydration"),
      blood_loss: new Hediff("blood_loss"),
      infection: new Hediff("infection", 0.05),
      fatigue: new Hediff("fatigue"),
      temp_stress: new Hediff("temp_stress")
    };
    this.bloodVolume = BLOOD_INITIAL;
    this.bleedingRate = BLEED_RATE_PER_HOUR;
    this.body = {
      head: { name: "head", missing: false },
      heart: { name: "heart", missing: false },
      torso: { name: "torso", missing: false }
    };
    this.unconscious = false;
    this.dead = false;
    this.position = { x: 0, y: 0 };
    this.cultivationProgress = 0;
    this.name = name;
    this.capacities = computeCapacities({
      hediffs: this.hediffs,
      needs: this.needs.needs,
      bloodVolume: this.bloodVolume
    });
  }
  updateNeeds(ticks, world) {
    this.needs.decay(ticks);
    const ambient = world ? world.getTempAt(this.position) : AMBIENT_TEMPERATURE_TARGET;
    const deltaTemp = (ambient - this.needs.getValue("temp")) * TEMPERATURE_DRIFT_PER_TICK * ticks;
    this.needs.adjustTemperature(deltaTemp);
    if (world) {
      const qi = world.getQiAt(this.position);
      const filth = world.getFilthAt(this.position);
      this.needs.needs.mind.value = clamp01(
        this.needs.needs.mind.value + (qi - 0.2) * 0.0008 * ticks - filth * 0.0006 * ticks
      );
    }
  }
  progressInfection(ticks) {
    const hours = ticks / TICKS_PER_HOUR;
    const infection = this.hediffs.infection;
    infection.setSeverity(Math.min(INFECTION_MAX, infection.severity + INFECTION_GROWTH_PER_HOUR * hours));
  }
  updateBleeding(ticks) {
    const hours = ticks / TICKS_PER_HOUR;
    const bleedPerHour = this.bleedingRate;
    this.bloodVolume = clamp01(this.bloodVolume - bleedPerHour * hours + BLOOD_RECOVERY_PER_HOUR * hours);
    this.bleedingRate = Math.max(0, this.bleedingRate - bleedPerHour * BLEED_HEAL_FACTOR * hours);
    this.hediffs.blood_loss.setSeverity(1 - this.bloodVolume);
  }
  refreshNeedHediffs() {
    const { food, water, rest, temp } = this.needs.needs;
    if (food.value < HEDIFF_THRESHOLDS.hunger) {
      const severity = clamp01((HEDIFF_THRESHOLDS.hunger - food.value) / HEDIFF_THRESHOLDS.hunger);
      this.hediffs.hunger.setSeverity(severity);
    } else {
      this.hediffs.hunger.setSeverity(0);
    }
    if (water.value < HEDIFF_THRESHOLDS.dehydration) {
      const severity = clamp01((HEDIFF_THRESHOLDS.dehydration - water.value) / HEDIFF_THRESHOLDS.dehydration);
      this.hediffs.dehydration.setSeverity(severity);
    } else {
      this.hediffs.dehydration.setSeverity(0);
    }
    if (rest.value < HEDIFF_THRESHOLDS.fatigue) {
      const severity = clamp01((HEDIFF_THRESHOLDS.fatigue - rest.value) / HEDIFF_THRESHOLDS.fatigue);
      this.hediffs.fatigue.setSeverity(severity);
    } else {
      this.hediffs.fatigue.setSeverity(0);
    }
    if (temp.value < HEDIFF_THRESHOLDS.tempLow) {
      const severity = clamp01((HEDIFF_THRESHOLDS.tempLow - temp.value) / HEDIFF_THRESHOLDS.tempLow);
      this.hediffs.temp_stress.setSeverity(severity);
    } else if (temp.value > HEDIFF_THRESHOLDS.tempHigh) {
      const severity = clamp01((temp.value - HEDIFF_THRESHOLDS.tempHigh) / (1 - HEDIFF_THRESHOLDS.tempHigh));
      this.hediffs.temp_stress.setSeverity(severity);
    } else {
      this.hediffs.temp_stress.setSeverity(0);
    }
  }
  updateCapacities() {
    this.capacities = computeCapacities({
      hediffs: this.hediffs,
      needs: this.needs.needs,
      bloodVolume: this.bloodVolume
    });
  }
  checkLifeState() {
    const criticalMissing = Object.values(this.body).some((part) => part.missing && CRITICAL_BODY_PARTS.includes(part.name));
    const consciousness = this.capacities.consciousness;
    this.unconscious = consciousness <= 0.15;
    this.dead = criticalMissing || consciousness <= 0 || this.bloodVolume <= 0;
  }
  tick(ticks = 1, world) {
    if (this.dead)
      return;
    this.ticksAlive += ticks;
    this.updateNeeds(ticks, world);
    this.progressInfection(ticks);
    this.updateBleeding(ticks);
    this.refreshNeedHediffs();
    this.updateCapacities();
    this.checkLifeState();
  }
  getMood() {
    return this.needs.getValue("mind");
  }
  setMissing(part) {
    if (this.body[part]) {
      this.body[part].missing = true;
    }
  }
}
