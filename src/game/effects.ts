import { config } from "./config";
import { toWorld } from "./geometry";
import type { Sprite } from "./sprites";
import type { World } from "./world";

export type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number };

type Explosion = {
  x: number;
  y: number;
  /** Where the sprite points, or null for one drawn upright. */
  angle: number | null;
  /** The ship's velocity, which its pieces partly keep. */
  vx?: number;
  vy?: number;
};

/**
 * Breaks a ship into its own pixels, which fly apart and fade. With reduced
 * motion they only fade, in place.
 */
export function explode(world: World, sprite: Sprite, { x, y, angle, vx = 0, vy = 0 }: Explosion) {
  const { pixel, radius } = world.field;
  const { life, speed, inherit } = config.explosion;
  const still = world.reducedMotion;

  for (const point of sprite.pixels) {
    const local = angle === null ? point : toWorld(point.x, point.y, angle);
    const distance = Math.hypot(local.x, local.y) || 1;
    const push = still ? 0 : (speed.min + Math.random() * (speed.max - speed.min)) * radius;
    const carry = still ? 0 : inherit;
    world.particles.push({
      x: x + local.x * pixel,
      y: y + local.y * pixel,
      vx: (local.x / distance) * push + vx * carry,
      vy: (local.y / distance) * push + vy * carry,
      age: 0,
      life: life * (0.6 + Math.random() * 0.4),
    });
  }
}

export function moveParticles(world: World, dt: number) {
  for (const particle of world.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.age += dt;
  }
  world.particles = world.particles.filter((particle) => particle.age < particle.life);
}
