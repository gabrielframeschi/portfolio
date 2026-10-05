export const TAU = Math.PI * 2;

export type Vec = { x: number; y: number };

/** Turns a point of a sprite, drawn nose up, to face the given angle. */
export function toWorld(x: number, y: number, angle: number): Vec {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  return { x: -x * sin - y * cos, y: x * cos - y * sin };
}

/** An angle in [-π, π). */
export function wrap(angle: number) {
  const turned = (angle + Math.PI) % TAU;
  return (turned < 0 ? turned + TAU : turned) - Math.PI;
}

export function lerp({ from, to }: { from: number; to: number }, t: number) {
  return from + (to - from) * t;
}
