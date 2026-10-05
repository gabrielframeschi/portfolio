import { config } from "./config";
import { lerp, TAU, type Vec } from "./geometry";
import { tieAdvanced, tieFighter, tieInterceptor } from "./sprites";
import type { Field, World } from "./world";

export type EnemyKind = "fighter" | "interceptor" | "advanced";

export const sprites = {
  fighter: tieFighter,
  interceptor: tieInterceptor,
  advanced: tieAdvanced,
} as const;

/** How an enemy flies. Positions are measured from the center, where the X-Wing sits. */
type Motion =
  /** A straight line at constant speed. */
  | { type: "straight"; vx: number; vy: number }
  /** A straight line to the center, swaying side to side less and less as it closes in. */
  | { type: "weave"; baseX: number; baseY: number; vx: number; vy: number; time: number; phase: number }
  /** A spiral to the center: the radius shrinks while the angle turns. */
  | { type: "spiral"; radius: number; angle: number; inward: number; turn: number };

export type Enemy = Vec & {
  kind: EnemyKind;
  hp: number;
  /** Counts down after a hit that did not destroy it. */
  flash: number;
  /** Time before it starts flying, so a formation enters one ship after another. */
  delay: number;
  /** Position at the previous step, to tell whether it is closing in or flying away. */
  px: number;
  py: number;
  motion: Motion;
};

type WaveKind = "single" | "pair" | "formation" | "interceptor";

/** Sends the next wave when its time comes, and Vader's TIE from time to time. */
export function spawnEnemies(world: World, dt: number) {
  const { waves, enemies } = config;
  world.elapsed += dt;
  const ramp = Math.min(world.elapsed / waves.rampTime, 1);
  const speed = lerp(waves.speed, ramp) * world.field.radius;

  world.waveTimer -= dt;
  if (world.waveTimer <= 0) {
    const kind = pickWave(world.elapsed);
    const interval = lerp(waves.interval, ramp);
    // A formation brings several ships at once, so the next wave waits longer.
    world.waveTimer += kind === "formation" ? interval * 1.6 : interval;
    sendWave(world, kind, speed);
  }

  const { advanced } = enemies;
  world.advancedTimer -= dt;
  if (world.advancedTimer <= 0) {
    world.advancedTimer += advanced.every;
    if (!world.enemies.some((enemy) => enemy.kind === "advanced")) sendAdvanced(world);
  }
}

export function moveEnemy(enemy: Enemy, field: Field, dt: number) {
  enemy.px = enemy.x;
  enemy.py = enemy.y;
  enemy.flash = Math.max(0, enemy.flash - dt);

  if (enemy.delay > 0) {
    enemy.delay -= dt;
    return;
  }

  const { motion } = enemy;
  switch (motion.type) {
    case "straight":
      enemy.x += motion.vx * dt;
      enemy.y += motion.vy * dt;
      break;

    case "weave": {
      const { amplitude, frequency } = config.enemies.interceptor.weave;
      motion.time += dt;
      motion.baseX += motion.vx * dt;
      motion.baseY += motion.vy * dt;
      const speed = Math.hypot(motion.vx, motion.vy);
      const fade = Math.min(1, Math.hypot(motion.baseX, motion.baseY) / field.radius);
      const sway = amplitude * field.radius * fade * Math.sin(TAU * frequency * motion.time + motion.phase);
      enemy.x = motion.baseX - (motion.vy / speed) * sway;
      enemy.y = motion.baseY + (motion.vx / speed) * sway;
      break;
    }

    case "spiral":
      motion.radius -= motion.inward * dt;
      motion.angle += motion.turn * dt;
      enemy.x = Math.cos(motion.angle) * motion.radius;
      enemy.y = Math.sin(motion.angle) * motion.radius;
      // Past the center, keep flying straight instead of spiraling back out.
      if (motion.radius <= 0) {
        enemy.motion = {
          type: "straight",
          vx: -Math.cos(motion.angle) * motion.inward,
          vy: -Math.sin(motion.angle) * motion.inward,
        };
      }
      break;
  }
}

/** Enemies enter from off the field, so they only leave once flying away from the center. */
export function isLeaving(enemy: Enemy, field: Field) {
  const margin = config.edgeMargin * field.pixel;
  const outside =
    Math.abs(enemy.x) > field.width / 2 + margin || Math.abs(enemy.y) > field.height / 2 + margin;
  return outside && enemy.delay <= 0 && enemy.x * (enemy.x - enemy.px) + enemy.y * (enemy.y - enemy.py) > 0;
}

function pickWave(elapsed: number): WaveKind {
  const { waves } = config;
  const kinds = (["single", "pair", "formation", "interceptor"] as const).filter(
    (kind) => elapsed >= waves[kind].from,
  );
  const total = kinds.reduce((sum, kind) => sum + waves[kind].weight, 0);
  let roll = Math.random() * total;
  for (const kind of kinds) {
    roll -= waves[kind].weight;
    if (roll <= 0) return kind;
  }
  return "single";
}

function sendWave(world: World, kind: WaveKind, speed: number) {
  const angle = Math.random() * TAU;

  switch (kind) {
    case "single":
      world.enemies.push(straightIn(world.field, angle, speed));
      break;

    case "pair":
      // From opposite sides, so the ship has to turn around.
      world.enemies.push(straightIn(world.field, angle, speed));
      world.enemies.push(straightIn(world.field, angle + Math.PI, speed));
      break;

    case "formation": {
      const { size, spacing, turn } = config.waves.formation;
      const count = size.min + Math.floor(Math.random() * (size.max - size.min + 1));
      const direction = Math.random() < 0.5 ? -1 : 1;
      const start = edgePoint(world.field, angle);
      for (let i = 0; i < count; i++) {
        world.enemies.push(
          enemy("fighter", start, i * spacing, {
            type: "spiral",
            radius: Math.hypot(start.x, start.y),
            angle,
            inward: speed,
            turn: turn * direction,
          }),
        );
      }
      break;
    }

    case "interceptor": {
      const start = edgePoint(world.field, angle);
      const fast = speed * config.enemies.interceptor.speed;
      world.enemies.push(
        enemy("interceptor", start, 0, {
          type: "weave",
          baseX: start.x,
          baseY: start.y,
          vx: -Math.cos(angle) * fast,
          vy: -Math.sin(angle) * fast,
          time: 0,
          phase: Math.random() * TAU,
        }),
      );
      break;
    }
  }
}

/** Vader crosses the whole field on a line that misses the X-Wing. */
function sendAdvanced(world: World) {
  const { field } = world;
  const { miss, speed } = config.enemies.advanced;
  const normal = Math.random() * TAU;
  const side = Math.random() < 0.5 ? -1 : 1;
  const ux = -Math.sin(normal) * side;
  const uy = Math.cos(normal) * side;
  const distance = lerp(miss, Math.random()) * field.radius;
  // Start far enough back along the line to be off the field.
  const back = Math.hypot(field.width, field.height) / 2 + config.edgeMargin * field.pixel;
  const start = {
    x: Math.cos(normal) * distance - ux * back,
    y: Math.sin(normal) * distance - uy * back,
  };
  world.enemies.push(
    enemy("advanced", start, 0, {
      type: "straight",
      vx: ux * speed * field.radius,
      vy: uy * speed * field.radius,
    }),
  );
}

function straightIn(field: Field, angle: number, speed: number) {
  const start = edgePoint(field, angle);
  return enemy("fighter", start, 0, {
    type: "straight",
    vx: -Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
  });
}

function enemy(kind: EnemyKind, { x, y }: Vec, delay: number, motion: Motion): Enemy {
  return { kind, x, y, px: x, py: y, hp: config.enemies[kind].hp, flash: 0, delay, motion };
}

/** Where a ray from the center leaves the field, plus room for a ship to hide. */
function edgePoint(field: Field, angle: number): Vec {
  const margin = config.edgeMargin * field.pixel;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const distance = Math.min(
    (field.width / 2 + margin) / Math.abs(cos),
    (field.height / 2 + margin) / Math.abs(sin),
  );
  return { x: cos * distance, y: sin * distance };
}
